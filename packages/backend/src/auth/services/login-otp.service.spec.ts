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
    computeFingerprint: jest.Mock;
    closeActiveSession: jest.Mock;
  };
  let otpService: { enforceOrThrow: jest.Mock };

  beforeEach(async () => {
    jwtService = { verify: jest.fn() };
    sessionFingerprintService = {
      findActiveSession: jest.fn(),
      computeFingerprint: jest.fn(),
      closeActiveSession: jest.fn().mockResolvedValue(undefined),
    };
    otpService = { enforceOrThrow: jest.fn() };

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
      sessionFingerprintService.computeFingerprint.mockReturnValue(
        "hash-original"
      );

      const result = await service.evaluate({
        user: USER,
        ip: IP,
        userAgent: UA,
        trustToken: "tt",
      });

      expect(result).toEqual({ kind: "trusted", session });
      expect(otpService.enforceOrThrow).not.toHaveBeenCalled();
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("falls back to OTP when the trust token signature is invalid", async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error("invalid signature");
      });
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
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
        response: { code: "OTP_REQUIRED" },
      });
      expect(sessionFingerprintService.closeActiveSession).toHaveBeenCalledWith(
        "structure",
        USER.id,
        "OTP_REQUIRED"
      );
    });

    it("falls back to OTP when the trust token sub is not structure-trust", async () => {
      jwtService.verify.mockReturnValue(
        buildTrustPayload({ sub: "something-else" as never })
      );
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when there is no active session", async () => {
      jwtService.verify.mockReturnValue(buildTrustPayload());
      sessionFingerprintService.findActiveSession.mockResolvedValue(null);
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when sessionUuid drifted (rotation)", async () => {
      jwtService.verify.mockReturnValue(
        buildTrustPayload({ sessionUuid: "old-session-uuid" })
      );
      sessionFingerprintService.findActiveSession.mockResolvedValue(
        buildSession({ uuid: "new-session-uuid" })
      );
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });
    });

    it("falls back to OTP when current IP/UA fingerprint does not match", async () => {
      jwtService.verify.mockReturnValue(buildTrustPayload());
      sessionFingerprintService.findActiveSession.mockResolvedValue(
        buildSession()
      );
      sessionFingerprintService.computeFingerprint.mockReturnValue(
        "hash-different"
      );
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: "9.9.9.9",
          userAgent: UA,
          trustToken: "tt",
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });
    });
  });

  describe("otp code path", () => {
    it("returns otp_validated when otpService accepts the code", async () => {
      otpService.enforceOrThrow.mockResolvedValue(undefined);

      const result = await service.evaluate({
        user: USER,
        ip: IP,
        userAgent: UA,
        otpCode: "123456",
      });

      expect(result).toEqual({ kind: "otp_validated" });
      expect(otpService.enforceOrThrow).toHaveBeenCalledTimes(1);
      expect(otpService.enforceOrThrow.mock.calls[0][1]).toBe("123456");
      // OTP-validated path does NOT close the session (rotation happens
      // through StructuresAuthService.login → startNewSession).
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("propagates OTP_INVALID from otpService", async () => {
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_INVALID" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          otpCode: "000000",
        })
      ).rejects.toMatchObject({ response: { code: "OTP_INVALID" } });
    });
  });

  describe("no token + no code", () => {
    it("closes the session, asks otpService to send a code, throws OTP_REQUIRED", async () => {
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({ user: USER, ip: IP, userAgent: UA })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });

      expect(sessionFingerprintService.closeActiveSession).toHaveBeenCalledWith(
        "structure",
        USER.id,
        "OTP_REQUIRED"
      );
      // enforceOrThrow called with null → generate+send path.
      expect(otpService.enforceOrThrow.mock.calls[0][1]).toBeNull();
    });
  });

  describe("forceResend", () => {
    it("calls enforceOrThrow with forceResend=true and does NOT close the session", async () => {
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          forceResend: true,
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });

      expect(otpService.enforceOrThrow).toHaveBeenCalledTimes(1);
      expect(otpService.enforceOrThrow.mock.calls[0][1]).toBeNull();
      expect(otpService.enforceOrThrow.mock.calls[0][2]).toEqual({
        forceResend: true,
      });
      // Resend on an OTP cycle that is already in progress: the session was
      // already closed on the initial login leg, no need to close it again.
      expect(
        sessionFingerprintService.closeActiveSession
      ).not.toHaveBeenCalled();
    });

    it("propagates OTP_RESEND_LIMIT from otpService", async () => {
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException(
          { code: "OTP_RESEND_LIMIT" },
          HttpStatus.TOO_MANY_REQUESTS
        )
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          forceResend: true,
        })
      ).rejects.toMatchObject({ response: { code: "OTP_RESEND_LIMIT" } });
    });

    it("ignores trustToken when forceResend is set", async () => {
      otpService.enforceOrThrow.mockRejectedValue(
        new HttpException({ code: "OTP_REQUIRED" }, HttpStatus.UNAUTHORIZED)
      );

      await expect(
        service.evaluate({
          user: USER,
          ip: IP,
          userAgent: UA,
          trustToken: "any-token",
          forceResend: true,
        })
      ).rejects.toMatchObject({ response: { code: "OTP_REQUIRED" } });

      // No trust verification on the resend path — straight to OTP mint.
      expect(jwtService.verify).not.toHaveBeenCalled();
    });
  });
});
