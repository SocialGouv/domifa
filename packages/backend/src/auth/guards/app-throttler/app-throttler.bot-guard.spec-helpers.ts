import { Controller, Get, ModuleMetadata } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { sign as jwtSign } from "jsonwebtoken";

import { domifaConfig } from "../../../config";
import { IpBanCacheService } from "../../../modules/ip-ban";
import { AppThrottlerGuard } from "./app-throttler.guard";

@Controller("test-bot-guard")
export class TestBotGuardController {
  @Get("ping")
  public ping(): { ok: true } {
    return { ok: true };
  }
}

@Controller("healthz")
export class HealthzMockController {
  @Get("")
  public root(): { ok: true } {
    return { ok: true };
  }
}

export const TEST_BOT_GUARD_NEST_MODULE: ModuleMetadata = {
  controllers: [TestBotGuardController, HealthzMockController],
  imports: [
    ThrottlerModule.forRoot([{ name: "short", ttl: 60_000, limit: 10_000 }]),
  ],
  providers: [
    IpBanCacheService,
    AppThrottlerGuard,
    { provide: APP_GUARD, useExisting: AppThrottlerGuard },
  ],
};

export const FICTIONAL_BOT_UAS: ReadonlyArray<string> = [
  "Mozilla/5.0 (compatible; FakeBot/1.0; +http://example.com/bot)",
  "Mozilla/5.0 (compatible; EvilScraper/2.0)",
  "Mozilla/5.0 (compatible; CustomCrawler/3.14; +http://example.com/crawl)",
];

export const BOT_USER_AGENTS: ReadonlyArray<string> = [
  "curl/8.4.0",
  "Wget/1.21.3",
  "python-requests/2.31.0",
  "Go-http-client/1.1",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
];

export const REAL_BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const TEST_STRUCTURE_USER_ID = 12;
export const TEST_STRUCTURE_USER_EMAIL = "s1-agent@yopmail.com";

export function signJwt(payload: Record<string, unknown>): string {
  return jwtSign(payload, domifaConfig().security.jwtSecret);
}

export function forgeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fakesig`;
}
