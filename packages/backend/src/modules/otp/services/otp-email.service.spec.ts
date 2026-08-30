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

// Domain listed in OTP_DUAL_SEND_DOMAINS — triggers Brevo + SMTP.
const DUAL_SEND_EMAIL = "user@mulhouse-alsace.fr";
// Regular domain — Brevo only.
const BREVO_ONLY_EMAIL = "user@example.com";

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
      email: BREVO_ONLY_EMAIL,
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
    expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).toContain("424242");
    expect(logSpy.mock.calls[0][0]).toContain("[OTP LOCAL]");
  });

  it("should not call sendMail when emailsEnabled is false", async () => {
    mockConfig.mockReturnValue(
      buildConfig({ envId: "dev", email: { emailsEnabled: false } })
    );

    await service.sendOtpEmail({
      email: BREVO_ONLY_EMAIL,
      prenom: "Alice",
      code: "123456",
      purpose: "LOGIN",
    });

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  describe("Dev OTP logging", () => {
    it("should log the plaintext OTP code in dev", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "dev",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "dev-test@x.com",
            otpProvider: "brevo",
          },
        })
      );
      mockSendMail.mockResolvedValue({ messageId: "<smtp-1>" });
      const logSpy = jest
        .spyOn(service["logger"], "log")
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      await service.sendOtpEmail({
        email: BREVO_ONLY_EMAIL,
        prenom: "Alice",
        code: "424242",
        purpose: "LOGIN",
      });

      expect(logSpy.mock.calls[0][0]).toContain("[OTP DEV]");
      expect(logSpy.mock.calls[0][0]).toContain("424242");
      // The log is additional: outside prod delivery goes through Tipimail.
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
    });

    it("should log the plaintext OTP code in dev even when emails are disabled", async () => {
      mockConfig.mockReturnValue(
        buildConfig({ envId: "dev", email: { emailsEnabled: false } })
      );
      const logSpy = jest
        .spyOn(service["logger"], "log")
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      await service.sendOtpEmail({
        email: BREVO_ONLY_EMAIL,
        prenom: "Alice",
        code: "424242",
        purpose: "LOGIN",
      });

      expect(logSpy.mock.calls[0][0]).toContain("[OTP DEV]");
      expect(logSpy.mock.calls[0][0]).toContain("424242");
      expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should NOT log the plaintext OTP code in preprod nor prod", async () => {
      mockSendMail.mockResolvedValue({ messageId: "<smtp-1>" });
      for (const envId of ["preprod", "prod"]) {
        mockConfig.mockReturnValue(
          buildConfig({
            envId,
            email: {
              emailsEnabled: true,
              emailAddressRedirectAllTo: "",
              otpProvider: "brevo",
            },
          })
        );
        const logSpy = jest
          .spyOn(service["logger"], "log")
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .mockImplementation(() => {});

        await service.sendOtpEmail({
          email: BREVO_ONLY_EMAIL,
          prenom: "Alice",
          code: "424242",
          purpose: "LOGIN",
        });

        for (const call of logSpy.mock.calls) {
          expect(String(call[0])).not.toContain("424242");
        }
        logSpy.mockRestore();
      }
    });
  });

  describe("Brevo-only routing (default)", () => {
    beforeEach(() => {
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
    });

    it("should send LOGIN OTP via Brevo only, without SMTP", async () => {
      await service.sendOtpEmail({
        email: BREVO_ONLY_EMAIL,
        prenom: "Alice",
        code: "246890",
        purpose: "LOGIN",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendMail).not.toHaveBeenCalled();
      const brevoArgs = mockBrevoSendEmailWithTemplate.mock.calls[0][0];
      expect(brevoArgs.templateId).toBe(101);
      expect(brevoArgs.to).toEqual([
        { email: BREVO_ONLY_EMAIL, name: BREVO_ONLY_EMAIL },
      ]);
      expect(brevoArgs.params).toEqual({ code: "246890", prenom: "Alice" });
    });

    it("should send action OTP via Brevo only with the action template", async () => {
      await service.sendOtpEmail({
        email: BREVO_ONLY_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "EXPORT_STRUCTURE_USAGERS",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendMail).not.toHaveBeenCalled();
      const brevoArgs = mockBrevoSendEmailWithTemplate.mock.calls[0][0];
      expect(brevoArgs.templateId).toBe(202);
      expect(brevoArgs.params).toEqual({
        code: "123456",
        prenom: "Alice",
        motif: "Export des usagers de la structure",
      });
    });

    it("should propagate the error when Brevo fails on a non-whitelisted domain", async () => {
      mockBrevoSendEmailWithTemplate.mockRejectedValue(new Error("Brevo boom"));

      await expect(
        service.sendOtpEmail({
          email: BREVO_ONLY_EMAIL,
          prenom: "Alice",
          code: "123456",
          purpose: "LOGIN",
        })
      ).rejects.toThrow("Brevo boom");
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should send via Tipimail SMTP only, to the redirect address, in non-prod", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "preprod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "preprod-test@x.com",
            otpProvider: "brevo",
          },
        })
      );
      mockSendMail.mockResolvedValue({ messageId: "<smtp-1>" });

      await service.sendOtpEmail({
        email: BREVO_ONLY_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      });

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail.mock.calls[0][0].to).toBe("preprod-test@x.com");
      expect(mockSendMail.mock.calls[0][0].html).toContain("123456");
      expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
    });
  });

  describe("Dual-send routing (whitelisted domains)", () => {
    beforeEach(() => {
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
      mockSendMail.mockResolvedValue({ messageId: "<smtp-1>" });
    });

    it("should send via both Brevo AND SMTP for a whitelisted domain", async () => {
      await service.sendOtpEmail({
        email: DUAL_SEND_EMAIL,
        prenom: "Alice",
        code: "246890",
        purpose: "LOGIN",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const smtpArgs = mockSendMail.mock.calls[0][0];
      expect(smtpArgs.to).toBe(DUAL_SEND_EMAIL);
      expect(smtpArgs.html).toContain("246890");
      const brevoArgs = mockBrevoSendEmailWithTemplate.mock.calls[0][0];
      expect(brevoArgs.templateId).toBe(101);
      expect(brevoArgs.to).toEqual([
        { email: DUAL_SEND_EMAIL, name: DUAL_SEND_EMAIL },
      ]);
    });

    it("should NOT throw when Brevo fails but SMTP delivers", async () => {
      mockBrevoSendEmailWithTemplate.mockRejectedValue(new Error("Brevo boom"));

      await service.sendOtpEmail({
        email: DUAL_SEND_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      });

      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    it("should NOT throw when SMTP fails but Brevo delivers", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP boom"));

      await service.sendOtpEmail({
        email: DUAL_SEND_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      });

      expect(mockBrevoSendEmailWithTemplate).toHaveBeenCalledTimes(1);
    });

    it("should throw when both providers reject", async () => {
      mockSendMail.mockRejectedValue(new Error("SMTP boom"));
      mockBrevoSendEmailWithTemplate.mockRejectedValue(new Error("Brevo boom"));

      await expect(
        service.sendOtpEmail({
          email: DUAL_SEND_EMAIL,
          prenom: "Alice",
          code: "123456",
          purpose: "LOGIN",
        })
      ).rejects.toThrow("SMTP boom");
    });

    it("should NOT throw when Brevo template id is missing but SMTP delivers", async () => {
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

      await service.sendOtpEmail({
        email: DUAL_SEND_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      });

      expect(mockBrevoSendEmailWithTemplate).not.toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    it("should surface a clear error when SMTP is misconfigured and Brevo also fails", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
          smtp: {
            host: "",
            port: 587,
            user: "",
            pass: "",
            from: "ignored-because-hardcoded@example.com",
            timeoutMs: 10_000,
          },
        })
      );
      mockBrevoSendEmailWithTemplate.mockRejectedValue(new Error("Brevo boom"));

      await expect(
        service.sendOtpEmail({
          email: DUAL_SEND_EMAIL,
          prenom: "Alice",
          code: "123456",
          purpose: "LOGIN",
        })
      ).rejects.toBeInstanceOf(InternalServerErrorException);
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should use the hardcoded Tipimail FROM regardless of env config", async () => {
      mockConfig.mockReturnValue(
        buildConfig({
          envId: "prod",
          email: {
            emailsEnabled: true,
            emailAddressRedirectAllTo: "",
            otpProvider: "brevo",
          },
          smtp: {
            host: "smtp.test.com",
            port: 587,
            user: "user",
            pass: "pass",
            from: "wrong@example.com",
            timeoutMs: 10_000,
          },
        })
      );

      await service.sendOtpEmail({
        email: DUAL_SEND_EMAIL,
        prenom: "Alice",
        code: "123456",
        purpose: "LOGIN",
      });

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail.mock.calls[0][0].from).toBe(
        "DomiFa <ne-pas-repondre@diffusion.fabrique.social.gouv.fr>"
      );
    });
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
});

describe("generateOtpEmailHtml", () => {
  it("should generate HTML containing the OTP code", () => {
    const html = generateOtpEmailHtml({ code: "246890" });
    expect(html).toContain("246890");
    expect(html).toContain("Votre code de connexion");
    expect(html).toContain("30 minutes");
  });

  it("should use generic greeting", () => {
    const html = generateOtpEmailHtml({ code: "123456" });
    expect(html).toContain("Bonjour,");
  });
});
