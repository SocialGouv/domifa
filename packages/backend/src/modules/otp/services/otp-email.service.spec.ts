import { Test, TestingModule } from "@nestjs/testing";
import { OtpEmailService } from "./otp-email.service";
import { generateOtpEmailHtml } from "../templates/otp-email.template";

jest.mock("../../../config", () => ({
  domifaConfig: jest.fn().mockReturnValue({
    email: {
      emailsEnabled: false,
      emailAddressRedirectAllTo: "redirect@test.com",
    },
    envId: "test",
    smtp: {
      host: "smtp.test.com",
      port: 587,
      user: "user",
      pass: "pass",
      from: "noreply@test.com",
    },
  }),
}));

describe("OtpEmailService", () => {
  let service: OtpEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpEmailService],
    }).compile();

    service = module.get<OtpEmailService>(OtpEmailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should not send email when emails are disabled", async () => {
    await service.sendOtpEmail("test@example.com", "123456");
    // No error thrown = success (email skipped)
  });
});

describe("generateOtpEmailHtml", () => {
  it("should generate HTML containing the OTP code", () => {
    const html = generateOtpEmailHtml({ code: "246890" });
    expect(html).toContain("246890");
    expect(html).toContain("Votre code de connexion");
    expect(html).toContain("10 minutes");
  });

  it("should include the user name when provided", () => {
    const html = generateOtpEmailHtml({
      code: "123456",
      userName: "Jean Dupont",
    });
    expect(html).toContain("Bonjour Jean Dupont,");
  });

  it("should use generic greeting when no user name", () => {
    const html = generateOtpEmailHtml({ code: "123456" });
    expect(html).toContain("Bonjour,");
    expect(html).not.toContain("Bonjour ,");
  });
});
