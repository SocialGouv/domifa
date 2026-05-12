import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { OtpService } from "./otp.service";
import { OtpEmailService } from "./otp-email.service";

const mockCountRecentByEmail = jest.fn();
const mockSave = jest.fn();
const mockFindValidOtp = jest.fn();
const mockIncrementAttempts = jest.fn();
const mockCreateQueryBuilder = jest.fn();

jest.mock("../../../database", () => ({
  get otpRepository() {
    return {
      countRecentByEmail: mockCountRecentByEmail,
      save: mockSave,
      findValidOtp: mockFindValidOtp,
      incrementAttempts: mockIncrementAttempts,
      createQueryBuilder: mockCreateQueryBuilder,
    };
  },
}));

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
    it("should return valid when OTP matches", async () => {
      const mockOtp = {
        uuid: "test-uuid",
        email: "test@example.com",
        used: false,
        attempts: 0,
      };
      mockFindValidOtp.mockResolvedValue(mockOtp);
      mockSave.mockResolvedValue({});

      const result = await service.verify({
        email: "test@example.com",
        code: "123456",
      });

      expect(result.valid).toBe(true);
      expect(mockOtp.used).toBe(true);
      expect(mockSave).toHaveBeenCalledWith(mockOtp);
    });

    it("should return invalid when no OTP found", async () => {
      mockFindValidOtp.mockResolvedValue(null);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("invalid");
    });

    it("should return expired when OTP has expired", async () => {
      mockFindValidOtp.mockResolvedValue(null);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          uuid: "test-uuid",
          expiresAt: new Date(Date.now() - 60000),
          attempts: 0,
          used: false,
        }),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
    });

    it("should return max-attempts when attempts exceeded", async () => {
      mockFindValidOtp.mockResolvedValue(null);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          uuid: "test-uuid",
          expiresAt: new Date(Date.now() + 60000),
          attempts: 5,
          used: false,
        }),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.verify({
        email: "test@example.com",
        code: "000000",
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("max-attempts");
    });

    it("should increment attempts on invalid code", async () => {
      mockFindValidOtp.mockResolvedValue(null);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          uuid: "test-uuid",
          expiresAt: new Date(Date.now() + 60000),
          attempts: 2,
          used: false,
        }),
      };
      mockCreateQueryBuilder.mockReturnValue(mockQueryBuilder);

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
