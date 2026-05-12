import { Controller, Get, ModuleMetadata } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import supertest from "supertest";

import { domifaConfig } from "../../../config";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { AppThrottlerGuard } from "./app-throttler.guard";

@Controller("test-bot-guard")
class TestBotGuardController {
  @Get("ping")
  ping() {
    return { ok: true };
  }
}

@Controller("healthz")
class HealthzMockController {
  @Get("")
  root() {
    return { ok: true };
  }
}

const TEST_BOT_GUARD_NEST_MODULE: ModuleMetadata = {
  controllers: [TestBotGuardController, HealthzMockController],
  imports: [
    // Permissive limits — throttler is not what we test here.
    ThrottlerModule.forRoot([{ name: "short", ttl: 60_000, limit: 10_000 }]),
  ],
  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
};

const REAL_BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BOT_USER_AGENTS = [
  "curl/8.4.0",
  "Wget/1.21.3",
  "python-requests/2.31.0",
  "Go-http-client/1.1",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
];

describe("AppThrottlerGuard - bot/origin filter", () => {
  let context: AppTestContext;
  let validOrigin: string;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(TEST_BOT_GUARD_NEST_MODULE, {
      initApp: true,
    });
    validOrigin = domifaConfig().apps.frontendUrl.replace(/\/$/, "");
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

  describe("bypasses internal probes", () => {
    it("allows the configured internal UA even with no Origin", async () => {
      const internalUa = domifaConfig().security.internalUserAgent;
      if (!internalUa) {
        // Env not configured for this test run — nothing to assert.
        return;
      }
      const res = await supertest(context.app.getHttpServer())
        .get("/test-bot-guard/ping")
        .set("User-Agent", internalUa);
      expect(res.status).toBe(200);
    });
  });
});
