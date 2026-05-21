import { InternalServerErrorException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

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

const mockBrevoSendEmailWithTemplate = jest.fn();
// Mock the Brevo sender module so importing it does NOT pull in the
// database/config chain (which would trigger domifaConfig() at module load
// time and break the jest.mock hoisting order).
jest.mock("../../mails/services/brevo-sender/brevo-sender.service", () => ({
  BrevoSenderService: class MockBrevoSenderService {
    sendEmailWithTemplate = mockBrevoSendEmailWithTemplate;
  },
}));

import { OtpEmailService } from "./otp-email.service";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

function buildConfig(overrides: Record<string, unknown> = {}) {
  return {
    envId: "test",
    email: {
      emailsEnabled: false,
      emailAddressRedirectAllTo: "",
      otpProvider: "smtp",
    },
    smtp: {
      host: "smtp.test.com",
      port: 587,
      user: "user",
      pass: "pass",
      from: "noreply@test.com",
      timeoutMs: 10_000,
    },
    brevo: {
      templates: {
        otpLogin: 101,
        otpAction: 202,
      },
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
    mockBrevoSendEmailWithTemplate.mockReset();
    mockBrevoSendEmailWithTemplate.mockResolvedValue({ messageId: "brevo-1" });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpEmailService,
        {
          provide: BrevoSenderService,
          useValue: {
            sendEmailWithTemplate: mockBrevoSendEmailWithTemplate,
          },
        },
      ],
    }).compile();

    service = module.get<OtpEmailService>(OtpEmailService);
  });

  it("should not call sendMail when envId is test", async () => {
    mockConfig.mockReturnValue(buildConfig({ envId: "test" }));

    await service.sendOtpEmail({
      email: "test@example.com",
      prenom: "Alice",
      code: "123456",
      purpose: "LOGIN",
    });

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should log the OTP code and skip sendMail when envId is local", async () => {
    mockConfig.mockReturnValue(
      buildConfig({ envId: "local", email: { emailsEnabled: true } })
    );
    const logSpy = jest
      .spyOn(service["logger"], "log")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    await service.sendOtpEmail({
      email: "dev@example.com",
      prenom: "Alice",
      code: "424242",
      purpose: "LOGIN",
    });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain("424242");
    expect(logSpy.mock.calls[0][0]).toContain("[OTP LOCAL]");
  });

  it("should not call sendMail when emailsEnabled is false", async () => {
    mockConfig.mockReturnValue(
      buildConfig({ envId: "dev", email: { emailsEnabled: false } })
    );

    await service.sendOtpEmail({
      email: "test@example.com",
      prenom: "Alice",
      code: "123456",
      purpose: "LOGIN",
    });

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
      service.sendOtpEmail({
        email: "test@example.com",
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      })
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
      service.sendOtpEmail({
        email: "test@example.com",
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      })
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

    await service.sendOtpEmail({
      email: "real@example.com",
      prenom: "Alice",
      code: "246890",
      purpose: "LOGIN",
    });

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
      service.sendOtpEmail({
        email: "real@example.com",
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      })
    ).rejects.toThrow("SMTP boom");
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toContain("SMTP boom");
    // Original recipient must be redacted, not leaked in the error log.
    expect(errSpy.mock.calls[0][0]).not.toContain("real@example.com");
  });

  describe("onModuleInit", () => {
    it("should skip when emailsEnabled is false", async () => {
      mockConfig.mockReturnValue(
        buildConfig({ envId: "dev", email: { emailsEnabled: false } })
      );

      await service.onModuleInit();

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should skip when envId is test", async () => {
      mockConfig.mockReturnValue(buildConfig({ envId: "test" }));

      await service.onModuleInit();

      expect(mockVerify).not.toHaveBeenCalled();
    });

    it("should never call transporter.verify() (live ping skipped)", async () => {
      mockConfig.mockReturnValue(
        buildConfig({ envId: "dev", email: { emailsEnabled: true } })
      );

      await service.onModuleInit();

      expect(mockVerify).not.toHaveBeenCalled();
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

    await service.sendOtpEmail({
      email: "real@example.com",
      prenom: "Alice",
      code: "123456",
      purpose: "LOGIN",
    });

    expect(mockSendMail.mock.calls[0][0].to).toBe("preprod-test@x.com");
  });

  describe("brevo provider", () => {
    it("should send LOGIN OTP via Brevo with the login template", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
        })
      );

      await service.sendOtpEmail({
        email: "real@example.com",
        prenom: "Alice",
        code: "246890",
        purpose: "LOGIN",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendMail).not.toHaveBeenCalled();
      const args = mockBrevoSendEmailWithTemplate.mock.calls[0][0];
      expect(args.templateId).toBe(101);
      expect(args.to).toEqual([
        { email: "real@example.com", name: "real@example.com" },
      ]);
      expect(args.params).toEqual({ code: "246890", prenom: "Alice" });
    });

    it("should send action OTP via Brevo with the action template", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
        })
      );

      await service.sendOtpEmail({
        email: "real@example.com",
        prenom: "Alice",
        code: "123456",
        purpose: "EXPORT",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
      const brevoArgs = mockBrevoSendEmailWithTemplate.mock.calls[0][0];
      expect(brevoArgs.templateId).toBe(202);
      expect(brevoArgs.params).toEqual({
        code: "123456",
        prenom: "Alice",
        motif: "Export des usagers",
      });
    });

    it("should propagate Brevo errors (no SMTP fallback)", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
        })
      );
      mockBrevoSendEmailWithTemplate.mockRejectedValue(new Error("Brevo boom"));

      await expect(
        service.sendOtpEmail({
          email: "real@example.com",
          prenom: "Alice",
          code: "123456",
          purpose: "LOGIN",
        })
      ).rejects.toThrow("Brevo boom");
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should throw when Brevo template id is missing", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
          brevo: { templates: { otpLogin: 0, otpAction: 202 } },
        })
      );

      await expect(
        service.sendOtpEmail({
          email: "real@example.com",
          prenom: "Alice",
          code: "123456",
          purpose: "LOGIN",
        })
      ).rejects.toThrow("DOMIFA_BREVO_TEMPLATES_OTP_LOGIN");
      expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });
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
