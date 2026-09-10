import { ExecutionContext } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common";
import { ThrottlerLimitDetail, ThrottlerModule } from "@nestjs/throttler";
import { MoreThanOrEqual } from "typeorm";

import { AppTestContext, AppTestHelper } from "../../../util/test";
import {
  AppLogSecurityTable,
  appIpBanRepository,
  appLogSecurityRepository,
} from "../../../database";
import { IpBanCacheService } from "../../../modules/ip-ban";
import { userStatusManager } from "../../../modules/users/services";
import { AppThrottlerGuard } from "./app-throttler.guard";
import {
  REAL_BROWSER_UA,
  signJwt,
  TEST_STRUCTURE_USER_EMAIL,
  TEST_STRUCTURE_USER_ID,
} from "./app-throttler.bot-guard.spec-helpers";

const TEST_NEST_MODULE: ModuleMetadata = {
  imports: [
    ThrottlerModule.forRoot([{ name: "short", ttl: 1_000, limit: 13 }]),
  ],
  providers: [IpBanCacheService, AppThrottlerGuard],
};

// Regression test for a bug found while manually walking through the
// support-mode feature: a burst of requests from an already-authenticated
// session (observed for real as ~9 near-simultaneous GET /me calls fired by
// the frontend right after a support-account login) trips this guard's rate
// limiter, which used to auto-block the JWT-identified account
// *permanently* (`throwThrottlingException` -> `applyThrottleAutoBlock`
// defaulted to `lockType: "permanent"`). For the single shared "support"
// account that meant one self-inflicted rate-limit trip took the whole
// feature down for every admin until someone flipped `status` back to
// ACTIVE by hand in the DB.
//
// `throwThrottlingException` is invoked directly (bypassing `canActivate`)
// because `AppThrottlerGuard.canActivate` short-circuits the rate limiter
// entirely when `envId === "test"` (see `SKIP_THROTTLE_ENVS`), so an
// HTTP-level integration test can never actually trip it under `ENV_FILE
// =tests-local`.
describe("AppThrottlerGuard - rate-limit auto-block lockType", () => {
  let context: AppTestContext;
  let guard: AppThrottlerGuard;
  let testStart: Date;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(TEST_NEST_MODULE, {
      initApp: false,
    });
    guard = context.module.get(AppThrottlerGuard);
    testStart = new Date();
  });

  afterAll(async () => {
    await appLogSecurityRepository
      .createQueryBuilder()
      .delete()
      .from(AppLogSecurityTable)
      .where("action = :action", { action: "BLOCK_USER" })
      .andWhere(`"createdAt" >= :start`, { start: testStart })
      .execute();
    await userStatusManager.unblockUser({
      userProfile: "structure",
      userId: TEST_STRUCTURE_USER_ID,
    });
    await appIpBanRepository.delete({ ip: "203.0.113.42" });
    await AppTestHelper.tearDownTestApp(context);
  });

  it("tripping the rate limit as an authenticated JWT user only TEMPORARILY blocks the account (not permanently)", async () => {
    const jwt = signJwt({
      _userId: TEST_STRUCTURE_USER_ID,
      _userProfile: "structure",
      email: TEST_STRUCTURE_USER_EMAIL,
      role: "agent",
      structureId: 1,
    });

    const fakeRequest = {
      headers: {
        authorization: `Bearer ${jwt}`,
        "user-agent": REAL_BROWSER_UA,
      },
      method: "GET",
      url: "/structures/auth/me",
      ip: "203.0.113.42",
    };
    const fakeContext = {
      switchToHttp: () => ({ getRequest: () => fakeRequest }),
    } as unknown as ExecutionContext;
    const limitDetail: ThrottlerLimitDetail = {
      key: "test-key",
      tracker: `user:structure:${TEST_STRUCTURE_USER_ID}`,
      ttl: 1_000,
      limit: 13,
      totalHits: 14,
      timeToExpire: 1,
      isBlocked: true,
      timeToBlockExpire: 1_800,
    };

    await expect(
      (
        guard as unknown as {
          throwThrottlingException: (
            ctx: ExecutionContext,
            detail: ThrottlerLimitDetail
          ) => Promise<void>;
        }
      ).throwThrottlingException(fakeContext, limitDetail)
    ).rejects.toMatchObject({ status: 429 });

    const status = await userStatusManager.getUserStatusFromDb({
      userProfile: "structure",
      userId: TEST_STRUCTURE_USER_ID,
    });
    // The regression: this used to come back "BLOCKED" (permanent).
    expect(status).toBe("TEMPORARILY_BLOCKED");

    const blockLogs = await appLogSecurityRepository.find({
      where: {
        action: "BLOCK_USER",
        userStructureId: TEST_STRUCTURE_USER_ID,
        createdAt: MoreThanOrEqual(testStart),
      },
    });
    expect(blockLogs).toHaveLength(1);
    expect(blockLogs[0].context.reason).toBe("throttle_authenticated");
    expect(blockLogs[0].context.lockType).toBe("temporary");
    expect(blockLogs[0].context.lockUntil).toBeTruthy();
  });
});
