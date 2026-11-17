import { Test, TestingModule } from "@nestjs/testing";
import { BrevoSenderService } from "./brevo-sender.service";
import { DEFAULT_BREVO_SENDER_DOMAIN } from "./brevo-senders.const";

// Brevo is only called from prod: pretend we are there so that the email
// reaches the (mocked) Brevo API
jest.mock("../../../../config", () => {
  const actual = jest.requireActual("../../../../config");
  return {
    ...actual,
    domifaConfig: () => {
      const config = actual.domifaConfig();
      return {
        ...config,
        envId: "prod",
        email: { ...config.email, emailsEnabled: true },
      };
    },
  };
});

describe("BrevoSenderService", () => {
  let service: BrevoSenderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrevoSenderService],
    }).compile();

    service = module.get<BrevoSenderService>(BrevoSenderService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("cleans user data before sending it to Brevo", async () => {
    jest
      .spyOn(service, "getPreferredSenderDomain")
      .mockResolvedValue(DEFAULT_BREVO_SENDER_DOMAIN);
    const sendTransacEmail = jest
      .spyOn(
        (service as unknown as { transactionalEmailsApi: any })
          .transactionalEmailsApi,
        "sendTransacEmail"
      )
      .mockResolvedValue({ body: { messageId: "test" } } as never);

    await service.sendEmailWithTemplate({
      templateId: 1,
      subject: "[MON DOMIFA] Objet\r\nBcc: pirate@example.org",
      params: {
        content: "Bonjour {{ params.lien }}\u202E\nligne 2",
        lien: "https://domifa.fr/reset?token=abc&userId=1",
      },
      to: [{ email: "support@example.org", name: "Domi\nFa" }],
      replyTo: { email: "jean@example.org", name: "Jean\r\nDupont" },
    });

    const email = sendTransacEmail.mock.calls[0][0] as any;
    expect(email.subject).toEqual("[MON DOMIFA] Objet Bcc: pirate@example.org");
    expect(email.params).toEqual({
      content: "Bonjour { { params.lien } }\nligne 2",
      // Links stay untouched while HTML escaping is disabled
      lien: "https://domifa.fr/reset?token=abc&userId=1",
    });
    expect(email.to).toEqual([
      { email: "support@example.org", name: "Domi Fa" },
    ]);
    expect(email.replyTo).toEqual({
      email: "jean@example.org",
      name: "Jean Dupont",
    });
  });
});
