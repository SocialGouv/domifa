import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { OtpService } from "./otp.service";
import { OtpEmailService } from "./otp-email.service";

const mockCountRecentByEmail = jest.fn();
const mockSave = jest.fn();
const mockClaimValidOtp = jest.fn();
const mockIncrementAttempts = jest.fn();
const mockCreateQueryBuilder = jest.fn();

jest.mock("../../../database", () => ({
  get otpRepository() {
    return {
      countRecentByEmail: mockCountRecentByEmail,
      save: mockSave,
      claimValidOtp: mockClaimValidOtp,
      incrementAttempts: mockIncrementAttempts,
      createQueryBuilder: mockCreateQueryBuilder,
    };
  },
}));

function buildQueryBuilder(getOneResult: unknown) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(getOneResult),
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
  });

  describe("generateAndSend", () => {
    it("should generate an OTP, save it hashed, and send email", async () => {
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

      expect(otpEmailService.sendOtpEmail).toHaveBeenCalledTimes(1);
      const emailArgs = (otpEmailService.sendOtpEmail as jest.Mock).mock
        .calls[0];
      expect(emailArgs[0]).toBe("test@example.com");
      expect(emailArgs[1]).toMatch(/^\d{6}$/);
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
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("should return invalid when no OTP found at all", async () => {
      mockClaimValidOtp.mockResolvedValue(null);
      // 1st QB call: pending non-expired -> null
      // 2nd QB call: any pending (expired or not) -> null
      mockCreateQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(null))
        .mockReturnValueOnce(buildQueryBuilder(null));

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("invalid");
      expect(mockIncrementAttempts).not.toHaveBeenCalled();
    });

    it("should return expired when only an expired pending OTP exists", async () => {
      mockClaimValidOtp.mockResolvedValue(null);
      // 1st QB call: pending non-expired -> null
      // 2nd QB call: any pending -> expired row
      mockCreateQueryBuilder
        .mockReturnValueOnce(buildQueryBuilder(null))
        .mockReturnValueOnce(
          buildQueryBuilder({
            uuid: "test-uuid",
            expiresAt: new Date(Date.now() - 60_000),
            attempts: 0,
            used: false,
          })
        );

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
      expect(mockIncrementAttempts).not.toHaveBeenCalled();
    });

    it("should return max-attempts when pending OTP has reached the limit", async () => {
      mockClaimValidOtp.mockResolvedValue(null);
      mockCreateQueryBuilder.mockReturnValueOnce(
        buildQueryBuilder({
          uuid: "test-uuid",
          expiresAt: new Date(Date.now() + 60_000),
          attempts: 5,
          used: false,
        })
      );

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("max-attempts");
      expect(mockIncrementAttempts).not.toHaveBeenCalled();
    });

    it("should increment attempts on invalid code", async () => {
      mockClaimValidOtp.mockResolvedValue(null);
      mockCreateQueryBuilder.mockReturnValueOnce(
        buildQueryBuilder({
          uuid: "test-uuid",
          expiresAt: new Date(Date.now() + 60_000),
          attempts: 2,
          used: false,
        })
      );

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("invalid");
      expect(mockIncrementAttempts).toHaveBeenCalledWith("test-uuid");
    });
  });
});
