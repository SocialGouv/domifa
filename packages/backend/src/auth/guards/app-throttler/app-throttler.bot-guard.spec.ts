import supertest from "supertest";
import { MoreThanOrEqual } from "typeorm";

import { domifaConfig } from "../../../config";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AppThrottlerGuard } from "./app-throttler.guard";
import {
  AppLogSecurityTable,
  appLogSecurityRepository,
} from "../../../database";
import { userStatusManager } from "../../../modules/users/services";
import {
  BOT_USER_AGENTS,
  FICTIONAL_BOT_UAS,
  forgeUnsignedJwt,
  REAL_BROWSER_UA,
  signJwt,
  TEST_BOT_GUARD_NEST_MODULE,
  TEST_STRUCTURE_USER_EMAIL,
  TEST_STRUCTURE_USER_ID,
} from "./app-throttler.bot-guard.spec-helpers";

describe("AppThrottlerGuard - bot/origin filter", () => {
  let context: AppTestContext;
  let validOrigin: string;
  let testStart: Date;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(TEST_BOT_GUARD_NEST_MODULE, {
      initApp: true,
    });
    validOrigin = domifaConfig().apps.frontendUrl.replace(/\/$/, "");
    testStart = new Date();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("allows legitimate requests", () => {
    it("passes with real browser UA + valid Origin (frontend)", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", validOrigin);
      expect(res.status).toBe(200);
    });

    it("passes with Origin = portail-usagers", async () => {
      const portailUsagersOrigin =
        domifaConfig().apps.portailUsagersUrl.replace(/\/$/, "");
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", portailUsagersOrigin);
      expect(res.status).toBe(200);
    });

    it("passes with Origin = portail-admins", async () => {
      const portailAdminOrigin = domifaConfig().apps.portailAdminUrl.replace(
        /\/$/,
        ""
      );
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", portailAdminOrigin);
      expect(res.status).toBe(200);
    });

    it("falls back to Referer when Origin is absent", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Referer", `${validOrigin}/some/page`);
      expect(res.status).toBe(200);
    });

    it("tolerates trailing slash in Origin", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", `${validOrigin}/`);
      expect(res.status).toBe(200);
    });
  });

  describe("blocks bot User-Agents", () => {
    it.each(BOT_USER_AGENTS)("blocks UA: %s", async (ua) => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", ua)
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);
    });
  });

  describe("blocks missing User-Agent", () => {
    it("blocks empty UA string", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", "")
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);
    });
  });

  describe("blocks invalid Origin", () => {
    it("blocks when neither Origin nor Referer is set", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA);
      expect(res.status).toBe(403);
    });

    it("blocks Origin not in whitelist", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Origin", "https://evil.example.com");
      expect(res.status).toBe(403);
    });

    it("blocks Referer pointing outside the whitelist", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", REAL_BROWSER_UA)
        .set("Referer", "https://evil.example.com/some/page");
      expect(res.status).toBe(403);
    });
  });

  describe("bypasses /healthz", () => {
    it("allows /healthz even with bot UA and no Origin", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/healthz")
        .set("User-Agent", "curl/8.4.0");
      expect(res.status).toBe(200);
    });
  });

  describe("persists REQUEST_BLOCKED logs and auto-blocks accounts", () => {
    const recentLogsFilter = () => ({
      createdAt: MoreThanOrEqual(testStart),
    });

    beforeEach(async () => {
      // Reset in-memory dedup so each scenario starts with a clean slate.
      const guard = context.module.get(AppThrottlerGuard);
      (
        guard as unknown as { activeBlocks: Map<string, string> }
      ).activeBlocks.clear();

      // Wipe only the logs we may have produced in this run.
      await appLogSecurityRepository
        .createQueryBuilder()
        .delete()
        .from(AppLogSecurityTable)
        .where("action IN (:...actions)", {
          actions: ["REQUEST_BLOCKED", "BLOCK_USER"],
        })
        .andWhere(`"createdAt" >= :start`, { start: testStart })
        .execute();

      // Restore the test user to ACTIVE so we can re-block from a known state.
      await userStatusManager.unblockUser({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
    });

    afterAll(async () => {
      await appLogSecurityRepository
        .createQueryBuilder()
        .delete()
        .from(AppLogSecurityTable)
        .where("action IN (:...actions)", {
          actions: ["REQUEST_BLOCKED", "BLOCK_USER"],
        })
        .andWhere(`"createdAt" >= :start`, { start: testStart })
        .execute();

      await userStatusManager.unblockUser({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
    });

    it("loop of 8 curl requests = 1 REQUEST_BLOCKED row with attempts=8 (dedup)", async () => {
      for (let i = 0; i < 8; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.5.0")
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("bot_ua");
      expect(logs[0].context.attempts).toBe(8);
      expect(logs[0].context.userAgent).toBe("curl/8.5.0");
    });

    it.each(FICTIONAL_BOT_UAS)(
      "detects fictional UA %s as bot_ua and logs it",
      async (ua) => {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", ua)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);

        const logs = await appLogSecurityRepository.find({
          where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
        });
        expect(logs).toHaveLength(1);
        expect(logs[0].context.reason).toBe("bot_ua");
        expect(logs[0].context.userAgent).toBe(ua);
        expect(logs[0].context.attempts).toBe(1);
      }
    );

    it.each([
      "curl/8.15.0",
      "Wget/1.21.3",
      "python-requests/2.31.0",
      "Go-http-client/1.1",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
    ])("logs known bot UA %s as bot_ua", async (ua) => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", ua)
        .set("Origin", validOrigin);
      expect(res.status).toBe(403);

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("bot_ua");
      expect(logs[0].context.userAgent).toBe(ua);
    });

    it("loop of 6 empty-UA requests = 1 log with missing_ua and attempts=6", async () => {
      for (let i = 0; i < 6; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "")
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("missing_ua");
      expect(logs[0].context.attempts).toBe(6);
    });

    it("persists curated request headers on REQUEST_BLOCKED context", async () => {
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", "curl/8.6.0")
        .set("Origin", validOrigin)
        .set("Accept", "application/json")
        .set("Accept-Language", "fr-FR,fr;q=0.9")
        .set("Accept-Encoding", "gzip, deflate, br")
        .set("Sec-Fetch-Site", "cross-site")
        .set("Sec-Fetch-Mode", "navigate")
        .set("Sec-Fetch-Dest", "document")
        .set("X-Forwarded-For", "203.0.113.7, 10.0.0.1")
        .set("X-Real-IP", "203.0.113.7")
        .set("X-Forwarded-Proto", "https");
      expect(res.status).toBe(403);

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      const headers = logs[0].context.headers;
      expect(headers).toBeDefined();
      expect(headers).toMatchObject({
        accept: "application/json",
        acceptLanguage: "fr-FR,fr;q=0.9",
        acceptEncoding: "gzip, deflate, br",
        secFetchSite: "cross-site",
        secFetchMode: "navigate",
        secFetchDest: "document",
        xForwardedFor: "203.0.113.7, 10.0.0.1",
        xRealIp: "203.0.113.7",
        xForwardedProto: "https",
      });
      // Sensitive headers must NOT leak into the log row.
      expect(headers).not.toHaveProperty("authorization");
      expect(headers).not.toHaveProperty("cookie");
    });

    it("loop of 7 invalid-origin requests = 1 log with invalid_origin and attempts=7", async () => {
      for (let i = 0; i < 7; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", REAL_BROWSER_UA)
          .set("Origin", "https://evil.example.com");
        expect(res.status).toBe(403);
      }

      const logs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].context.reason).toBe("invalid_origin");
      expect(logs[0].context.attempts).toBe(7);
    });

    it("auto-blocks an authenticated structure user on the very first bot request; 10 attempts produce a single BLOCK_USER log", async () => {
      const jwt = signJwt({
        _userId: TEST_STRUCTURE_USER_ID,
        _userProfile: "structure",
        email: TEST_STRUCTURE_USER_EMAIL,
        role: "agent",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.0.0")
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      // Account is BLOCKED in DB
      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
      expect(status).toBe("BLOCKED");

      // Exactly one BLOCK_USER log, with the right context
      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(1);
      expect(blockLogs[0].context.autoBlocked).toBe(true);
      expect(blockLogs[0].context.triggeredBy).toBe("AppThrottlerGuard");
      expect(blockLogs[0].context.reason).toBe("bot_ua");
      // Régression : `ip` et `userAgent` doivent toujours être présents dans
      // les colonnes dédiées (pas seulement dans le JSON `context`).
      expect(blockLogs[0].ip).toBeTruthy();
      expect(blockLogs[0].userAgent).toBe("curl/8.0.0");
      // SUBJECT = target user — split into userStructureId / userSupervisorId
      // on AppLogSecurityTable (no shared userId column).
      expect(blockLogs[0].userStructureId).toBe(TEST_STRUCTURE_USER_ID);
      expect(blockLogs[0].userType).toBe("user_structure");

      // REQUEST_BLOCKED dedup'd to one row with attempts=10 and per-user key
      const reqLogs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(reqLogs).toHaveLength(1);
      expect(reqLogs[0].context.attempts).toBe(10);
      expect(reqLogs[0].context.jwtUser.userId).toBe(TEST_STRUCTURE_USER_ID);
      expect(reqLogs[0].context.jwtUser.userProfile).toBe("structure");
    });

    it("never auto-blocks a usager profile even after 10 bot requests", async () => {
      const jwt = signJwt({
        _userId: 999,
        _userProfile: "usager",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.0.0")
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(0);
    });

    it("does not auto-block on invalid_origin — only bot_ua and missing_ua trigger account lock", async () => {
      const jwt = signJwt({
        _userId: TEST_STRUCTURE_USER_ID,
        _userProfile: "structure",
        email: TEST_STRUCTURE_USER_EMAIL,
        role: "agent",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", REAL_BROWSER_UA)
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", "https://evil.example.com");
        expect(res.status).toBe(403);
      }

      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
      expect(status).not.toBe("BLOCKED");

      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(0);
    });

    // Régression sécurité : un JWT à signature invalide ne doit pas
    // déclencher l'auto-block du compte revendiqué. Sinon n'importe qui
    // peut bloquer n'importe quel compte structure/supervisor connu.
    it("ignores a forged (unsigned) JWT — does not auto-block the claimed account", async () => {
      const jwt = forgeUnsignedJwt({
        _userId: TEST_STRUCTURE_USER_ID,
        _userProfile: "structure",
        email: TEST_STRUCTURE_USER_EMAIL,
        role: "agent",
        structureId: 1,
      });

      for (let i = 0; i < 10; i++) {
        const res = await supertest(context.app.getHttpServer())
          .get("/test-bot-guard/ping")
          .set("User-Agent", "curl/8.0.0")
          .set("Authorization", `Bearer ${jwt}`)
          .set("Origin", validOrigin);
        expect(res.status).toBe(403);
      }

      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: TEST_STRUCTURE_USER_ID,
      });
      expect(status).not.toBe("BLOCKED");

      const blockLogs = await appLogSecurityRepository.find({
        where: { action: "BLOCK_USER", ...recentLogsFilter() },
      });
      expect(blockLogs).toHaveLength(0);

      // Le log REQUEST_BLOCKED doit exister (la requête a été refusée pour
      // bot_ua), mais sans champ jwtUser (signature KO → traité anonyme).
      const reqLogs = await appLogSecurityRepository.find({
        where: { action: "REQUEST_BLOCKED", ...recentLogsFilter() },
      });
      expect(reqLogs).toHaveLength(1);
      expect(reqLogs[0].context.jwtUser).toBeUndefined();
    });
  });
});
