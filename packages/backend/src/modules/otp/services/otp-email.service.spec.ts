import { InternalServerErrorException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { OtpEmailService } from "./otp-email.service";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

const mockSendMail = jest.fn();
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
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
    },
    ...overrides,
  };
}

describe("OtpEmailService", () => {
  let service: OtpEmailService;

  beforeEach(async () => {
    mockSendMail.mockReset();
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

  it("should silently skip in dev when SMTP host is missing", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "dev",
        email: { emailsEnabled: true },
        smtp: { host: "", port: 587, user: "", pass: "", from: "" },
      })
    );

    await expect(
      service.sendOtpEmail("test@example.com", "123456")
    ).resolves.toBeUndefined();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should throw in prod when SMTP host is missing", async () => {
    mockConfig.mockReturnValue(
      buildConfig({
        envId: "prod",
        email: { emailsEnabled: true },
        smtp: { host: "", port: 587, user: "", pass: "", from: "" },
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
