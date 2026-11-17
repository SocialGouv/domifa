import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { AppTestContext, AppTestHelper } from "../../../util/test";
import { appLogger } from "../../../util";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { ContactSupportModule } from "../contact-support.module";

// appLogger is a Proxy: it cannot be spied on, so it is replaced by mocks
jest.mock("../../../util", () => {
  const mocks: Record<string | symbol, jest.Mock> = {};
  return {
    ...jest.requireActual("../../../util"),
    appLogger: new Proxy(mocks, {
      get: (target, name) => (target[name] ??= jest.fn()),
    }),
  };
});

const VALID = {
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@example.org",
  phone: { countryCode: "fr", numero: "06 12 34 56 78" },
  regionCode: "11",
  departement: "93",
  structureName: "CCAS de Saint-Denis",
  subject: "AUTRE",
  content: "Je n'arrive pas à consulter mes courriers.",
};

describe("ContactSupportController - POST /contact/mon-domifa", () => {
  let context: AppTestContext;
  let sendEmail: jest.SpyInstance;

  const post = (body: Record<string, unknown>) =>
    supertest(context.app.getHttpServer())
      .post("/contact/mon-domifa")
      .send(body);

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      { imports: [ContactSupportModule] },
      { initApp: true }
    );
  });

  beforeEach(() => {
    sendEmail = jest
      .spyOn(context.module.get(BrevoSenderService), "sendEmailWithTemplate")
      .mockResolvedValue({ messageId: "test" } as never);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("200: sends the request to the support mailbox", async () => {
    const response = await post(VALID);

    expect(response.status).toBe(HttpStatus.OK);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const email = sendEmail.mock.calls[0][0];
    expect(email.subject).toEqual(
      "[MON DOMIFA] J'ai une autre demande - CCAS de Saint-Denis"
    );
    expect(email.replyTo).toEqual({
      email: "jean.dupont@example.org",
      name: "Jean Dupont",
    });
    expect(email.params).toMatchObject({
      name: "Jean Dupont",
      phone: "06 12 34 56 78",
      content: "Je n'arrive pas à consulter mes courriers.",
      structureName:
        "CCAS de Saint-Denis (93 - Seine-Saint-Denis, Île-de-France)",
    });
  });

  it("200: an optional message may be omitted", async () => {
    const response = await post({
      ...VALID,
      phone: null,
      subject: "INFORMATION_COURRIER",
      content: "",
    });

    expect(response.status).toBe(HttpStatus.OK);
    expect(sendEmail.mock.calls[0][0].params).toMatchObject({
      phone: "Non renseigné",
      content: "Aucun message complémentaire",
    });
  });

  it("200: tags are stripped before reaching Brevo", async () => {
    const response = await post({
      ...VALID,
      nom: "<img src=x onerror=alert(1)>Dupont",
      content: "<script>alert(1)</script>Bonjour le support",
    });

    expect(response.status).toBe(HttpStatus.OK);
    const { params } = sendEmail.mock.calls[0][0];
    expect(params.name).toEqual("Jean Dupont");
    expect(params.content).toEqual("alert(1)Bonjour le support");
  });

  it.each([
    ["missing email", { email: "" }],
    ["unknown subject", { subject: "FORMATION" }],
    ["missing message", { subject: "SUPPRESSION_DONNEES", content: "" }],
    ["invalid phone", { phone: { countryCode: "fr", numero: "((((((" } }],
    ["departement outside the region", { regionCode: "84" }],
  ])("400: %s", async (_label, override) => {
    const response = await post({ ...VALID, ...override });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("500: Brevo error is logged without personal data", async () => {
    sendEmail.mockRejectedValue(new Error("Brevo unavailable"));
    const logError = appLogger.error as unknown as jest.Mock;
    logError.mockClear();

    const response = await post(VALID);

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ message: "CONTACT_FORM_ERROR" });
    expect(logError).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(logError.mock.calls[0]);
    expect(logged).toContain("Brevo unavailable");
    expect(logged).not.toContain(VALID.email);
    expect(logged).not.toContain(VALID.content);
  });
});
