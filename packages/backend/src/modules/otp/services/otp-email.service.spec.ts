import { InternalServerErrorException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { OtpEmailService } from "./otp-email.service";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

const mockSendMail = jest.fn();
const mockVerify = jest.fn();
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
    verify: mockVerify,
  })),
}));

const mockConfig = jest.fn();
jest.mock("../../../config", () => ({
  get domifaConfig() {
    return mockConfig;
  },
}));

function buildConfig(overrides: Record<string, unknown> = {}) {
  return {
    envId: "test",
    email: { emailsEnabled: false, emailAddressRedirectAllTo: "" },
    smtp: {
      host: "smtp.test.com",
      port: 587,
      user: "user",
      pass: "pass",
      from: "noreply@test.com",
      timeoutMs: 10_000,
    },
    ...overrides,
  };
}

describe("OtpEmailService", () => {
  let service: OtpEmailService;

  beforeEach(async () => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
    mockVerify.mockResolvedValue(true);
    mockConfig.mockReset();
    mockConfig.mockReturnValue(buildConfig());

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpEmailService],
    }).compile();

    service = module.get<OtpEmailService>(OtpEmailService);
  });

  it("should not call sendMail when envId is test", async () => {
    mockConfig.mockReturnValue(buildConfig({ envId: "test" }));

    await service.sendOtpEmail("test@example.com", "123456");

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should not call sendMail when emailsEnabled is false", async () => {
    mockConfig.mockReturnValue(
      buildConfig({ envId: "dev", email: { emailsEnabled: false } })
    );

    await service.sendOtpEmail("test@example.com", "123456");

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should throw in dev when SMTP host is missing", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "dev",
        email: { emailsEnabled: true },
        smtp: {
          host: "",
          port: 587,
          user: "",
          pass: "",
          from: "",
          timeoutMs: 10_000,
        },
      })
    );

    await expect(
      service.sendOtpEmail("test@example.com", "123456")
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should throw in prod when SMTP host is missing", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "prod",
        email: { emailsEnabled: true },
        smtp: {
          host: "",
          port: 587,
          user: "",
          pass: "",
          from: "",
          timeoutMs: 10_000,
        },
      })
    );

    await expect(
      service.sendOtpEmail("test@example.com", "123456")
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should send to original address in prod", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "prod",
        email: {
          emailsEnabled: true,
          emailAddressRedirectAllTo: "redir@x.com",
        },
      })
    );
    mockSendMail.mockResolvedValue({ messageId: "<msg-1>" });

    await service.sendOtpEmail("real@example.com", "246890");

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const args = mockSendMail.mock.calls[0][0];
    expect(args.to).toBe("real@example.com");
    expect(args.from).toBe("noreply@test.com");
    expect(args.subject).toContain("DomiFa");
    expect(args.html).toContain("246890");
  });

  it("should log and re-throw when sendMail rejects", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "prod",
        email: { emailsEnabled: true, emailAddressRedirectAllTo: "" },
      })
    );
    mockSendMail.mockRejectedValue(new Error("SMTP boom"));
    const errSpy = jest
      .spyOn(service["logger"], "error")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    await expect(
      service.sendOtpEmail("real@example.com", "123456")
    ).rejects.toThrow("SMTP boom");
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toContain("SMTP boom");
    // Original recipient must be redacted, not leaked in the error log.
    expect(errSpy.mock.calls[0][0]).not.toContain("real@example.com");
  });

  describe("onModuleInit", () => {
    it("should skip verify when emailsEnabled is false", async () => {
      mockConfig.mockReturnValue(
        buildConfig({ envId: "dev", email: { emailsEnabled: false } })
      );

      await service.onModuleInit();

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should skip verify when envId is test", async () => {
      mockConfig.mockReturnValue(buildConfig({ envId: "test" }));

      await service.onModuleInit();

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should log error and not crash when SMTP config is incomplete", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "dev",
          email: { emailsEnabled: true },
          smtp: {
            host: "",
            port: 587,
            user: "",
            pass: "",
            from: "",
            timeoutMs: 10_000,
          },
        })
      );
      const errSpy = jest
        .spyOn(service["logger"], "error")
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(mockVerify).not.toHaveBeenCalled();
      expect(errSpy.mock.calls[0][0]).toContain("SMTP config incomplete");
    });

    it("should call verify and not crash when verify rejects", async () => {
      mockConfig.mockReturnValue(
        buildConfig({ envId: "dev", email: { emailsEnabled: true } })
      );
      mockVerify.mockRejectedValue(new Error("SMTP unreachable"));
      const errSpy = jest
        .spyOn(service["logger"], "error")
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(errSpy.mock.calls[0][0]).toContain("SMTP verify failed");
    });
  });

  it("should redirect to test address in non-prod when configured", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "preprod",
        email: {
          emailsEnabled: true,
          emailAddressRedirectAllTo: "preprod-test@x.com",
        },
      })
    );
    mockSendMail.mockResolvedValue({ messageId: "<msg-2>" });

    await service.sendOtpEmail("real@example.com", "123456");

    expect(mockSendMail.mock.calls[0][0].to).toBe("preprod-test@x.com");
  });
});

describe("generateOtpEmailHtml", () => {
  it("should generate HTML containing the OTP code", () => {
    const html = generateOtpEmailHtml({ code: "246890" });
    expect(html).toContain("246890");
    expect(html).toContain("Votre code de connexion");
    expect(html).toContain("10 minutes");
  });

  it("should use generic greeting", () => {
    const html = generateOtpEmailHtml({ code: "123456" });
    expect(html).toContain("Bonjour,");
  });
});
