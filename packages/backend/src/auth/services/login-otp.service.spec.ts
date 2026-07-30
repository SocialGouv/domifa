import { HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

// Mock the OtpService module path so importing the symbol below doesn't pull
// in the database/config chain (which would crash on missing env vars at
// module load time in pure unit-test contexts).
jest.mock("../../modules/otp/services/otp.service", () => ({
  OtpService: class MockOtpService {},
}));

import {
  CurrentUserSession,
  STRUCTURE_TRUST_JWT_SUBJECT,
  StructureTrustJwtPayload,
} from "../../_common/model";
import { OtpService } from "../../modules/otp/services/otp.service";
import { LoginOtpService } from "./login-otp.service";
import { SessionFingerprintService } from "./session-fingerprint.service";

const USER = {
  id: 42,
  uuid: "user-uuid-42",
  email: "agent@example.com",
  prenom: "Alice",
};
const IP = "1.2.3.4";
const UA = "Mozilla/5.0";

function buildSession(
  overrides: Partial<CurrentUserSession> = {}
): CurrentUserSession {
  return {
    uuid: "session-uuid-1",
    salt: "salt-xyz",
    fingerprintHash: "hash-original",
    ipAddress: IP,
    userAgent: UA,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    lastVerifiedAt: null,
    ...overrides,
  };
}

function buildTrustPayload(
  overrides: Partial<StructureTrustJwtPayload> = {}
): StructureTrustJwtPayload {
  return {
    sub: STRUCTURE_TRUST_JWT_SUBJECT,
    userUuid: USER.uuid,
    userId: USER.id,
    sessionUuid: "session-uuid-1",
    salt: "salt-xyz",
    fingerprintHash: "hash-original",
    ...overrides,
  };
}

describe("LoginOtpService", () => {
  let service: LoginOtpService;
  let jwtService: { verify: jest.Mock };
  let sessionFingerprintService: {
    findActiveSession: jest.Mock;
    closeActiveSession: jest.Mock;
  };
  let otpService: { requireValidOtp: jest.Mock };

  beforeEach(async () => {
    jwtService = { verify: jest.fn() };
    sessionFingerprintService = {
      findActiveSession: jest.fn(),
      closeActiveSession: jest.fn().mockResolvedValue(undefined),
    };
    otpService = { requireValidOtp: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginOtpService,
        { provide: JwtService, useValue: jwtService },
        {
          provide: SessionFingerprintService,
          useValue: sessionFingerprintService,
        },
        { provide: OtpService, useValue: otpService },
      ],
    }).compile();

    service = module.get(LoginOtpService);
  });

  describe("trust token path", () => {
    it("returns trusted when token, session and fingerprint all match", async () => {
      jwtService.verify.mockReturnValue(buildTrustPayload());
      const session = buildSession();
      sessionFingerprintService.findActiveSession.mockResolvedValue(session);

      const result = await service.evaluate({
        user: USER,
        ip: IP,
        userAgent: UA,
        trustToken: "tt",
      });

      expect(result).toEqual({ kind: "trusted", session });
      expect(otpService.requireValidOtp).not.toHaveBeenCalled();
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("falls back to OTP when the trust token signature is invalid", async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error("invalid signature");
      });
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
        response: { message: "OTP_REQUIRED" },
      });
      // The previous valid session is preserved: it will only be rotated
      // when the new login actually completes (startNewSession on OTP
      // success).
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("falls back to OTP when the trust token sub is not structure-trust", async () => {
      jwtService.verify.mockReturnValue(
        buildTrustPayload({ sub: "something-else" as never })
      );
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { message: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when there is no active session", async () => {
      jwtService.verify.mockReturnValue(buildTrustPayload());
      sessionFingerprintService.findActiveSession.mockResolvedValue(null);
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { message: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when sessionUuid drifted (rotation)", async () => {
      jwtService.verify.mockReturnValue(
        buildTrustPayload({ sessionUuid: "old-session-uuid" })
      );
      sessionFingerprintService.findActiveSession.mockResolvedValue(
        buildSession({ uuid: "new-session-uuid" })
      );
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { message: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when the stored fingerprint no longer matches the trust token (session rotated)", async () => {
      jwtService.verify.mockReturnValue(buildTrustPayload());
      sessionFingerprintService.findActiveSession.mockResolvedValue(
        buildSession({ fingerprintHash: "hash-rotated" })
      );
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { message: "OTP_REQUIRED" } });
    });

    it("returns trusted regardless of current IP/UA — fingerprint is treated as an opaque token", async () => {
      // Hash check is verbatim: the request's IP and UA are not consulted.
      // A laptop moving from office wifi to mobile data must keep its
      // trust token usable.
      jwtService.verify.mockReturnValue(buildTrustPayload());
      const session = buildSession();
      sessionFingerprintService.findActiveSession.mockResolvedValue(session);

      const result = await service.evaluate({
        user: USER,
        ip: "9.9.9.9",
        userAgent: "Totally-Different-Browser",
        trustToken: "tt",
      });

      expect(result).toEqual({ kind: "trusted", session });
      expect(otpService.requireValidOtp).not.toHaveBeenCalled();
    });
  });

  describe("otp code path", () => {
    it("returns otp_validated when otpService accepts the code", async () => {
      otpService.requireValidOtp.mockResolvedValue(undefined);

      const result = await service.evaluate({
        user: USER,
        ip: IP,
        userAgent: UA,
        otpCode: "123456",
      });

      expect(result).toEqual({ kind: "otp_validated" });
      expect(otpService.requireValidOtp).toHaveBeenCalledTimes(1);
      expect(otpService.requireValidOtp.mock.calls[0][1]).toBe("123456");
      // OTP-validated path does NOT close the session (rotation happens
      // through StructuresAuthService.login → startNewSession).
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("propagates OTP_CODE_INVALID from otpService", async () => {
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException(
          { message: "OTP_CODE_INVALID" },
          HttpStatus.UNAUTHORIZED
        )
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          otpCode: "000000",
        })
      ).rejects.toMatchObject({ response: { message: "OTP_CODE_INVALID" } });
    });
  });

  describe("no token + no code", () => {
    it("asks otpService to send a code, throws OTP_REQUIRED, and keeps the current session alive", async () => {
      otpService.requireValidOtp.mockRejectedValue(
        new HttpException({ message: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({ user: USER, ip: IP, userAgent: UA })
      ).rejects.toMatchObject({ response: { message: "OTP_REQUIRED" } });

      // The active session is preserved during the OTP cycle: rotation is
      // deferred to startNewSession once OTP is validated (with reason
      // REPLACED). Closing here would log out the legitimate user before
      // the new attempt proves itself.
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
      // requireValidOtp called with null → generate+send path.
      expect(otpService.requireValidOtp.mock.calls[0][1]).toBeNull();
    });
  });
});
