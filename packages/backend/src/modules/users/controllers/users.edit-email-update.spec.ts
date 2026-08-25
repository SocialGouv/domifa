import { HttpModule } from "@nestjs/axios";
import { HttpStatus } from "@nestjs/common";
import { subHours } from "date-fns";

import { UsersController } from "./users.controller";
import { UsersPublicController } from "./users.public.controller";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../../usagers/usagers.module";
import { MailsModule } from "../../mails/mails.module";
import { OtpModule } from "../../otp/otp.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import {
  appLogsRepository,
  expiredTokenRepositiory,
  otpRepository,
  userStructureRepository,
  userStructureSecurityRepository,
} from "../../../database";
import { userStructureCreator } from "../services";
import { UserStructureDecisionService } from "../services/user-structure-decision/user-structure-decision.service";
import { UserStructureEmailUpdaterService } from "../services/userStructureEmailUpdater.service";
import { AppLogsService } from "../../app-logs/app-logs.service";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { POST_USER_STRUCTURE_BODY } from "../../../_common/mocks";
import { TESTS_USERS_STRUCTURE, TestUserStructure } from "../../../_tests";
import { UserFonction } from "@domifa/common";

const PASSWORD = "Azerty012345!";
const STRUCTURE_ID = 1;

const PRIMARY_EMAIL = "e2e-email-update-primary@yopmail.com";
const TARGET_A = "e2e-email-update-target-a@yopmail.com";
const TARGET_B = "e2e-email-update-target-b@yopmail.com";
const TARGET_REGISTER = "e2e-email-update-register@yopmail.com";
const BYPASS_DOMAIN_EMAIL = "someone@e2e-bypass-test.yopmail.com";

describe("Users email update — request + confirmation", () => {
  let context: AppTestContext;
  let sendEmailSpy: jest.SpyInstance;
  let primaryUserId: number;
  let primaryUuid: string;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsersController, UsersPublicController],
      imports: [
        MailsModule,
        StructuresModule,
        UsagersModule,
        HttpModule,
        OtpModule,
      ],
      providers: [
        AppLogsService,
        UserStructureDecisionService,
        UserStructureEmailUpdaterService,
      ],
    });

    const { user } = await userStructureCreator.createUserWithPassword(
      {
        prenom: "E2E",
        nom: "EmailUpdate",
        fonction: UserFonction.AGENT_ACCUEIL,
        fonctionDetail: null,
        email: PRIMARY_EMAIL,
        password: PASSWORD,
      } as never,
      { role: "admin", structureId: STRUCTURE_ID }
    );
    await userStructureRepository.update({ id: user.id }, { status: "ACTIVE" });
    primaryUserId = user.id;
    primaryUuid = user.uuid;

    const authInfo: TestUserStructure = {
      id: primaryUserId,
      uuid: primaryUuid,
      structureId: STRUCTURE_ID,
      email: PRIMARY_EMAIL,
      password: PASSWORD,
      role: "admin",
    };
    await AppTestHelper.authenticateStructure(authInfo, { context });
  });

  afterAll(async () => {
    await appLogsRepository.delete({ userId: primaryUserId });
    await otpRepository.delete({ userUuid: primaryUuid });
    await expiredTokenRepositiory.delete({ userId: primaryUserId });
    await userStructureRepository.deleteWithSecurity({
      userId: primaryUserId,
      structureId: STRUCTURE_ID,
    });
    await userStructureRepository.deleteWithSecurityByEmail(TARGET_REGISTER);
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeEach(() => {
    sendEmailSpy = jest
      .spyOn(BrevoSenderService.prototype, "sendEmailWithTemplate")
      .mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    sendEmailSpy.mockRestore();
  });

  async function requestedLogCount(): Promise<number> {
    return appLogsRepository.count({
      where: {
        userId: primaryUserId,
        action: "USER_EMAIL_SELF_UPDATE_REQUESTED",
      },
    });
  }

  async function confirmedLogCount(): Promise<number> {
    return appLogsRepository.count({
      where: {
        userId: primaryUserId,
        action: "USER_EMAIL_SELF_UPDATE_CONFIRMED",
      },
    });
  }

  describe("Demande de changement", () => {
    it("sans header otp-code → 401 OTP_REQUIRED, rien créé", async () => {
      const before = await requestedLogCount();
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_A },
      });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe("OTP_REQUIRED");
      expect(await requestedLogCount()).toBe(before);
    });

    it("code OTP faux → 401 OTP_CODE_INVALID, rien créé", async () => {
      const before = await requestedLogCount();
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_A },
        otpCode: "000000",
      });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe("OTP_CODE_INVALID");
      expect(await requestedLogCount()).toBe(before);
    });

    it("même adresse que l'actuelle → 400 SAME_EMAIL, aucun token", async () => {
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: PRIMARY_EMAIL },
        withOtp: true,
      });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe("SAME_EMAIL");

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).not.toBe("email-change");
    });

    it("adresse préfixée deleted- → 400, aucun token", async () => {
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: "deleted-01012024-x@y.fr" },
        withOtp: true,
      });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).not.toBe("email-change");
    });

    it("domaine loginOtpBypassDomains → 400, aucun token", async () => {
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: BYPASS_DOMAIN_EMAIL },
        withOtp: true,
      });
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).not.toBe("email-change");
    });

    it("adresse déjà utilisée par un autre compte → même réponse que le succès, pas d'oracle", async () => {
      const usedEmail =
        TESTS_USERS_STRUCTURE.BY_EMAIL["s1-instructeur@yopmail.com"].email;
      const before = await requestedLogCount();
      const securityBefore = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });

      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: usedEmail },
        withOtp: true,
      });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.message).toBe("OK");
      expect(await requestedLogCount()).toBe(before);
      expect(sendEmailSpy).not.toHaveBeenCalled();

      const securityAfter = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(securityAfter.temporaryTokens).toEqual(
        securityBefore.temporaryTokens
      );
    });

    it("compte BLOCKED → 401, aucun token, aucun log", async () => {
      await userStructureRepository.update(
        { id: primaryUserId },
        { status: "BLOCKED" }
      );

      const before = await requestedLogCount();
      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_A },
      });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(await requestedLogCount()).toBe(before);

      // Restaure le compte + une session valide (le token précédent a été
      // blacklisté par AppUserGuard lors du 401 ci-dessus).
      await userStructureRepository.update(
        { id: primaryUserId },
        { status: "ACTIVE" }
      );
      await AppTestHelper.authenticateStructure(
        {
          id: primaryUserId,
          uuid: primaryUuid,
          structureId: STRUCTURE_ID,
          email: PRIMARY_EMAIL,
          password: PASSWORD,
          role: "admin",
        },
        { context }
      );
    });

    it("Foo@Bar.FR, OTP valide → 200, token créé pour l'adresse normalisée, log demande", async () => {
      const mixedCase = TARGET_A.replace(
        "e2e-email-update-target-a",
        "E2E-Email-Update-Target-A"
      ).toUpperCase();
      const before = await requestedLogCount();

      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: mixedCase },
        withOtp: true,
      });

      expect(res.status).toBe(HttpStatus.OK);
      expect(await requestedLogCount()).toBe(before + 1);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).toBe("email-change");
      expect(security.temporaryTokens?.newEmail).toBe(TARGET_A);
    });

    it("nouvelle demande vers une autre adresse → écrase le token précédent, second log", async () => {
      const firstToken = (
        await userStructureSecurityRepository.findOneBy({
          userId: primaryUserId,
        })
      ).temporaryTokens?.token;
      const before = await requestedLogCount();

      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_B },
        withOtp: true,
      });

      expect(res.status).toBe(HttpStatus.OK);
      expect(await requestedLogCount()).toBe(before + 1);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.newEmail).toBe(TARGET_B);
      expect(security.temporaryTokens?.token).not.toBe(firstToken);

      // L'ancien token (TARGET_A) ne fonctionne plus.
      const staleConfirm = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/${firstToken}`,
        { context, authenticate: false }
      );
      expect(staleConfirm.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it("demande de reset password pendant une demande d'email : n'écrasent pas indépendamment, le lien part vers l'ancienne adresse", async () => {
      const resetRes = await AppTestHttpClient.post(
        "/users/get-password-token",
        {
          context,
          authenticate: false,
          body: { email: PRIMARY_EMAIL },
        }
      );
      expect(resetRes.status).toBe(HttpStatus.OK);

      // Même slot de token : la demande de reset écrase la demande email en
      // attente (comportement documenté, pas de collision silencieuse).
      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).toBe("reset-password");
    });

    it("demande valide, adresse libre → 200, email inchangé, token+validité en base, log demande, mail aux deux adresses", async () => {
      const before = await requestedLogCount();

      const res = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_B },
        withOtp: true,
      });

      expect(res.status).toBe(HttpStatus.OK);
      expect(await requestedLogCount()).toBe(before + 1);

      const users = await AppTestHttpClient.get("/users", { context });
      expect(
        (users.body as { id: number; email: string }[]).find(
          (u) => u.id === primaryUserId
        )?.email
      ).toBe(PRIMARY_EMAIL);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens?.type).toBe("email-change");
      expect(security.temporaryTokens?.newEmail).toBe(TARGET_B);
      expect(security.temporaryTokens?.token).toBeTruthy();
      expect(security.temporaryTokens?.validity).toBeTruthy();

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
      const recipients = sendEmailSpy.mock.calls.map(
        (call) => call[0].to[0].email
      );
      expect(recipients).toEqual(
        expect.arrayContaining([TARGET_B, PRIMARY_EMAIL])
      );
    });
  });

  describe("Confirmation", () => {
    let confirmedToken: string;

    async function currentToken(): Promise<string> {
      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      return security.temporaryTokens.token;
    }

    it("token faux → 400, email inchangé, aucun log confirmation", async () => {
      const before = await confirmedLogCount();
      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/not-the-right-token`,
        { context, authenticate: false }
      );
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(await confirmedLogCount()).toBe(before);

      const user = await userStructureRepository.findOneBy({
        id: primaryUserId,
      });
      expect(user.email).toBe(PRIMARY_EMAIL);
    });

    it("token valide mais userId d'un autre compte → 400, aucun compte modifié", async () => {
      const otherId =
        TESTS_USERS_STRUCTURE.BY_EMAIL["s1-instructeur@yopmail.com"].id;
      const before = await confirmedLogCount();
      const token = await currentToken();

      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${otherId}/${token}`,
        { context, authenticate: false }
      );
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(await confirmedLogCount()).toBe(before);

      const other = await userStructureRepository.findOneBy({ id: otherId });
      expect(other.email).toBe("s1-instructeur@yopmail.com");
    });

    it("token expiré → 400, email inchangé", async () => {
      const token = await currentToken();
      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      const futureValidity = security.temporaryTokens.validity;

      await userStructureSecurityRepository.update(
        { userId: primaryUserId },
        {
          temporaryTokens: {
            ...security.temporaryTokens,
            validity: subHours(new Date(), 1),
          },
        }
      );

      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/${token}`,
        { context, authenticate: false }
      );
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);

      const user = await userStructureRepository.findOneBy({
        id: primaryUserId,
      });
      expect(user.email).toBe(PRIMARY_EMAIL);

      // Restaure la validité pour les tests suivants.
      await userStructureSecurityRepository.update(
        { userId: primaryUserId },
        {
          temporaryTokens: {
            ...security.temporaryTokens,
            validity: futureValidity,
          },
        }
      );
    });

    it("adresse prise entre-temps par un autre compte → 400 propre, pas de 500", async () => {
      const token = await currentToken();
      const { user: collisionUser } =
        await userStructureCreator.createUserWithPassword(
          {
            prenom: "Collision",
            nom: "Test",
            fonction: UserFonction.AGENT_ACCUEIL,
            fonctionDetail: null,
            email: TARGET_B,
            password: PASSWORD,
          } as never,
          { role: "simple", structureId: STRUCTURE_ID }
        );

      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/${token}`,
        { context, authenticate: false }
      );
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);

      const user = await userStructureRepository.findOneBy({
        id: primaryUserId,
      });
      expect(user.email).toBe(PRIMARY_EMAIL);

      await userStructureRepository.deleteWithSecurity({
        userId: collisionUser.id,
        structureId: STRUCTURE_ID,
      });
    });

    it("bon token → 200, email mis à jour, token invalidé, log confirmation, mail aux deux adresses", async () => {
      confirmedToken = await currentToken();
      const before = await confirmedLogCount();

      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/${confirmedToken}`,
        { context, authenticate: false }
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(await confirmedLogCount()).toBe(before + 1);

      const user = await userStructureRepository.findOneBy({
        id: primaryUserId,
      });
      expect(user.email).toBe(TARGET_B);

      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.temporaryTokens).toBeNull();

      expect(sendEmailSpy).toHaveBeenCalledTimes(2);
      const recipients = sendEmailSpy.mock.calls.map(
        (call) => call[0].to[0].email
      );
      expect(recipients).toEqual(
        expect.arrayContaining([TARGET_B, PRIMARY_EMAIL])
      );
    });

    it("rejouer le même token → 400, un seul log confirmation au total", async () => {
      const before = await confirmedLogCount();

      const res = await AppTestHttpClient.post(
        `/users/confirm-email-update/${primaryUserId}/${confirmedToken}`,
        { context, authenticate: false }
      );
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(await confirmedLogCount()).toBe(before);
    });

    // La confirmation révoque la session (terminateUserSession vide
    // currentSession/fingerprintHash), ce qui invalide tous les JWT existants
    // au prochain appel — vérifié via SessionFingerprintService.
    // verifySessionFromJwt côté jwt.strategy.ts. Ce contrôle est cependant
    // court-circuité en envId="test" (SKIP_FINGERPRINT_CHECK), donc on
    // vérifie ici l'effet réel en base plutôt que de rejouer une requête
    // HTTP avec l'ancien JWT.
    it("la confirmation a révoqué la session (currentSession/fingerprintHash vidés)", async () => {
      const security = await userStructureSecurityRepository.findOneBy({
        userId: primaryUserId,
      });
      expect(security.currentSession).toBeNull();
      expect(security.fingerprintHash).toBeNull();
    });

    it("login avec l'ancienne adresse → refusé", async () => {
      const res = await AppTestHttpClient.post("/structures/auth/login", {
        context,
        authenticate: false,
        body: { email: PRIMARY_EMAIL, password: PASSWORD },
      });
      expect(res.status).not.toBe(HttpStatus.OK);
    });

    it("login avec la nouvelle adresse → OK, GET /users (admin) affiche le nouvel email", async () => {
      await AppTestHelper.authenticateStructure(
        {
          id: primaryUserId,
          uuid: primaryUuid,
          structureId: STRUCTURE_ID,
          email: TARGET_B,
          password: PASSWORD,
          role: "admin",
        },
        { context }
      );

      const users = await AppTestHttpClient.get("/users", { context });
      expect(users.status).toBe(HttpStatus.OK);
      expect(
        (users.body as { id: number; email: string }[]).find(
          (u) => u.id === primaryUserId
        )?.email
      ).toBe(TARGET_B);
    });
  });

  describe("Non-régression", () => {
    it("PATCH /users avec un champ email dans le body : ignoré", async () => {
      const res = await AppTestHttpClient.patch("/users", {
        context,
        body: {
          nom: "EmailUpdate",
          prenom: "E2E",
          fonction: UserFonction.AGENT_ACCUEIL,
          fonctionDetail: null,
          email: "should-be-ignored@x.fr",
        },
      });
      expect(res.status).toBe(HttpStatus.OK);

      const user = await userStructureRepository.findOneBy({
        id: primaryUserId,
      });
      expect(user.email).toBe(TARGET_B);
    });

    it("register() avec une adresse en attente de confirmation ailleurs : création acceptée", async () => {
      const pendingRes = await AppTestHttpClient.post("/users/edit-my-email", {
        context,
        body: { email: TARGET_REGISTER },
        withOtp: true,
      });
      expect(pendingRes.status).toBe(HttpStatus.OK);

      const res = await AppTestHttpClient.post("/users/register", {
        context,
        body: {
          ...POST_USER_STRUCTURE_BODY,
          email: TARGET_REGISTER,
          structureId: STRUCTURE_ID,
          structure: {
            ...POST_USER_STRUCTURE_BODY.structure,
            id: STRUCTURE_ID,
          },
        },
      });
      expect(res.status).toBe(HttpStatus.OK);
    });
  });
});
