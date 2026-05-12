import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { createHash, createHmac } from "node:crypto";
import { OtpService } from "./otp.service";
import { OtpEmailService } from "./otp-email.service";

const mockCountRecentByEmail = jest.fn();
const mockSave = jest.fn();
const mockClaimValidOtp = jest.fn();
const mockIncrementLatestPendingAttempts = jest.fn();

jest.mock("../../../database", () => ({
  get otpRepository() {
    return {
      countRecentByEmail: mockCountRecentByEmail,
      save: mockSave,
      claimValidOtp: mockClaimValidOtp,
      incrementLatestPendingAttempts: mockIncrementLatestPendingAttempts,
    };
  },
}));

const mockDomifaConfig = jest.fn();
jest.mock("../../../config", () => ({
  get domifaConfig() {
    return mockDomifaConfig;
  },
}));

function buildConfig(overrides: Record<string, unknown> = {}) {
  return {
    envId: "test",
    otp: { pepper: "" },
    ...overrides,
  };
}

describe("OtpService", () => {
  let service: OtpService;
  let otpEmailService: OtpEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: OtpEmailService,
          useValue: {
            sendOtpEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpEmailService = module.get<OtpEmailService>(OtpEmailService);

    jest.clearAllMocks();
    mockDomifaConfig.mockReturnValue(buildConfig());
  });

  describe("generateAndSend", () => {
    it("should generate an OTP, save it hashed (SHA-256 fallback when no pepper), and send email", async () => {
      mockCountRecentByEmail.mockResolvedValue(0);
      mockSave.mockResolvedValue({});

      const result = await service.generateAndSend({
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

      expect(mockSave).toHaveBeenCalledTimes(1);
      const savedOtp = mockSave.mock.calls[0][0];
      expect(savedOtp.email).toBe("test@example.com");
      expect(savedOtp.code).not.toMatch(/^\d{6}$/);
      expect(savedOtp.code).toHaveLength(64);

      const sentCode = (otpEmailService.sendOtpEmail as jest.Mock).mock
        .calls[0][1] as string;
      const expected = createHash("sha256").update(sentCode).digest("hex");
      expect(savedOtp.code).toBe(expected);
      expect(sentCode).toMatch(/^\d{6}$/);
    });

    it("should hash with HMAC-SHA256 when pepper is configured", async () => {
      mockDomifaConfig.mockReturnValue(
        buildConfig({ envId: "prod", otp: { pepper: "secret-pepper" } })
      );
      mockCountRecentByEmail.mockResolvedValue(0);
      mockSave.mockResolvedValue({});

      await service.generateAndSend({ email: "test@example.com" });

      const savedOtp = mockSave.mock.calls[0][0];
      const sentCode = (otpEmailService.sendOtpEmail as jest.Mock).mock
        .calls[0][1] as string;
      const expected = createHmac("sha256", "secret-pepper")
        .update(sentCode)
        .digest("hex");
      expect(savedOtp.code).toBe(expected);
    });

    it("should reject when rate limit exceeded", async () => {
      mockCountRecentByEmail.mockResolvedValue(3);

      await expect(
        service.generateAndSend({ email: "test@example.com" })
      ).rejects.toThrow(HttpException);

      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should pass purpose to saved OTP", async () => {
      mockCountRecentByEmail.mockResolvedValue(0);
      mockSave.mockResolvedValue({});

      await service.generateAndSend({
        email: "test@example.com",
        purpose: "login-2fa",
      });

      const savedOtp = mockSave.mock.calls[0][0];
      expect(savedOtp.purpose).toBe("login-2fa");
    });
  });

  describe("verify", () => {
    it("should return valid when claimValidOtp returns a row (atomic claim)", async () => {
      mockClaimValidOtp.mockResolvedValue({
        uuid: "test-uuid",
        email: "test@example.com",
        used: true,
        attempts: 0,
      });

      const result = await service.verify({
        email: "test@example.com",
        code: "123456",
      });

      expect(result.valid).toBe(true);
      expect(mockClaimValidOtp).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(String),
        5
      );
      expect(mockIncrementLatestPendingAttempts).not.toHaveBeenCalled();
    });

    it("should return invalid and increment when an eligible pending OTP exists with wrong code", async () => {
      mockClaimValidOtp.mockResolvedValue(null);
      mockIncrementLatestPendingAttempts.mockResolvedValue({
        uuid: "test-uuid",
        attempts: 3,
      });

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(mockIncrementLatestPendingAttempts).toHaveBeenCalledWith(
        "test@example.com",
        5
      );
    });

    it("should return invalid (unified) when no eligible OTP exists", async () => {
      // Covers all "no eligible" cases: no OTP, expired, or max-attempts.
      // The response intentionally does not distinguish them.
      mockClaimValidOtp.mockResolvedValue(null);
      mockIncrementLatestPendingAttempts.mockResolvedValue(null);

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result).not.toHaveProperty("reason");
    });

    it("should not leak between different non-valid cases", async () => {
      mockClaimValidOtp.mockResolvedValue(null);

      // Case 1: no OTP at all
      mockIncrementLatestPendingAttempts.mockResolvedValueOnce(null);
      const noOtp = await service.verify({
        email: "a@x.com",
        code: "000000",
      });

      // Case 2: eligible pending, wrong code
      mockIncrementLatestPendingAttempts.mockResolvedValueOnce({
        uuid: "u",
        attempts: 1,
      });
      const wrongCode = await service.verify({
        email: "b@x.com",
        code: "000000",
      });

      expect(noOtp).toEqual({ valid: false });
      expect(wrongCode).toEqual({ valid: false });
    });
  });
});
