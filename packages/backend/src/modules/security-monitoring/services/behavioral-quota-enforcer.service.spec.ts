import { Test, TestingModule } from "@nestjs/testing";
import { MoreThanOrEqual } from "typeorm";

import { domifaConfig } from "../../../config";
import {
  appLogsRepository,
  AppLogTable,
  appLogSecurityRepository,
  AppLogSecurityTable,
} from "../../../database";
import { UserStructureAuthenticated } from "../../../_common/model";
import { userStatusManager } from "../../users/services";
import { AppTestHelper } from "../../../util/test";
import { BehavioralQuotaEnforcerService } from "./behavioral-quota-enforcer.service";

// Reuses two seeded users from the same structure so we can assert that
// blocking the first crosser does not leak to the second agent (only the
// download path is enforced for him — his account stays ACTIVE).
const STRUCTURE_ID = 1;
const FIRST_CROSSER_USER_ID = 12; // s1-agent
const FIRST_CROSSER_EMAIL = "s1-agent@yopmail.com";
const SECOND_AGENT_USER_ID = 2; // s1-instructeur
const SECOND_AGENT_EMAIL = "s1-instructeur@yopmail.com";

function buildAuthUser(params: {
  id: number;
  email: string;
  role: "simple" | "agent" | "responsable" | "admin";
}): UserStructureAuthenticated {
  return {
    _userId: params.id,
    _userProfile: "structure",
    id: params.id,
    uuid: "00000000-0000-0000-0000-000000000000",
    email: params.email,
    nom: "Test",
    prenom: "Test",
    role: params.role,
    structureId: STRUCTURE_ID,
    status: "ACTIVE",
    acceptTerms: new Date(),
  } as unknown as UserStructureAuthenticated;
}

describe("BehavioralQuotaEnforcerService", () => {
  let module: TestingModule;
  let service: BehavioralQuotaEnforcerService;
  let testStart: Date;

  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
    module = await Test.createTestingModule({
      providers: [BehavioralQuotaEnforcerService],
    }).compile();
    service = module.get(BehavioralQuotaEnforcerService);
  });

  afterAll(async () => {
    await module.close();
    await AppTestHelper.tearDownTestConnection();
  });

  beforeEach(async () => {
    testStart = new Date();
    await resetState();
  });

  afterEach(async () => {
    await resetState();
  });

  async function resetState(): Promise<void> {
    await appLogsRepository
      .createQueryBuilder()
      .delete()
      .from(AppLogTable)
      .where("action IN (:...actions)", {
        actions: ["USAGERS_DOCS_DOWNLOAD", "USAGERS_DELETE"],
      })
      .andWhere("structureId = :structureId", { structureId: STRUCTURE_ID })
      .execute();
    await appLogSecurityRepository
      .createQueryBuilder()
      .delete()
      .from(AppLogSecurityTable)
      .where("action = :action", { action: "BLOCK_USER" })
      .andWhere(`"structureId" = :structureId`, {
        structureId: STRUCTURE_ID,
      })
      .execute();
    await userStatusManager.unblockUser({
      userProfile: "structure",
      userId: FIRST_CROSSER_USER_ID,
    });
    await userStatusManager.unblockUser({
      userProfile: "structure",
      userId: SECOND_AGENT_USER_ID,
    });
  }

  async function seedAppLogs(action: string, count: number): Promise<void> {
    if (count <= 0) return;
    const rows = Array.from({ length: count }, () => ({
      structureId: STRUCTURE_ID,
      userStructureId: FIRST_CROSSER_USER_ID,
      userType: "user_structure",
      action,
      role: "agent",
      version: 1,
    }));
    await appLogsRepository.insert(rows as Partial<AppLogTable>[]);
  }

  async function recentBlockLogs(): Promise<AppLogSecurityTable[]> {
    return await appLogSecurityRepository.find({
      where: {
        action: "BLOCK_USER",
        structureId: STRUCTURE_ID,
        createdAt: MoreThanOrEqual(testStart),
      },
    });
  }

  describe("USAGERS_DOCS_DOWNLOAD", () => {
    const blockThreshold = () =>
      domifaConfig().quotas.usagersDocsDownloadBlockPerDay;

    it("allows the call when today's count is below the block threshold", async () => {
      await seedAppLogs("USAGERS_DOCS_DOWNLOAD", blockThreshold() - 1);

      const result = await service.enforceBeforeAction({
        action: "USAGERS_DOCS_DOWNLOAD",
        user: buildAuthUser({
          id: FIRST_CROSSER_USER_ID,
          email: FIRST_CROSSER_EMAIL,
          role: "agent",
        }),
      });

      expect(result).toEqual({ allowed: true });
      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: FIRST_CROSSER_USER_ID,
      });
      expect(status).toBe("ACTIVE");
      expect(await recentBlockLogs()).toHaveLength(0);
    });

    it("blocks the crosser, writes a BLOCK_USER log, and marks status BLOCKED", async () => {
      await seedAppLogs("USAGERS_DOCS_DOWNLOAD", blockThreshold());

      const result = await service.enforceBeforeAction({
        action: "USAGERS_DOCS_DOWNLOAD",
        user: buildAuthUser({
          id: FIRST_CROSSER_USER_ID,
          email: FIRST_CROSSER_EMAIL,
          role: "agent",
        }),
      });

      expect(result).toEqual({ allowed: false, blockedNow: true });
      const status = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: FIRST_CROSSER_USER_ID,
      });
      expect(status).toBe("BLOCKED");

      const blocks = await recentBlockLogs();
      expect(blocks).toHaveLength(1);
      expect(blocks[0].userStructureId).toBe(FIRST_CROSSER_USER_ID);
      expect(blocks[0].context.reason).toBe("quota_docs_download");
      expect(blocks[0].context.autoBlocked).toBe(true);
      expect(blocks[0].context.triggeredBy).toBe(
        "BehavioralQuotaEnforcerService"
      );
      expect(blocks[0].context.kind).toBe("USAGERS_DOCS_DOWNLOAD");
      expect(blocks[0].context.threshold).toBe(blockThreshold());
    });

    it("refuses subsequent agents from the same structure without re-blocking", async () => {
      await seedAppLogs("USAGERS_DOCS_DOWNLOAD", blockThreshold());

      // First call: crosser is blocked.
      await service.enforceBeforeAction({
        action: "USAGERS_DOCS_DOWNLOAD",
        user: buildAuthUser({
          id: FIRST_CROSSER_USER_ID,
          email: FIRST_CROSSER_EMAIL,
          role: "agent",
        }),
      });

      // Second call from another agent of the same structure: 429, no block.
      const result = await service.enforceBeforeAction({
        action: "USAGERS_DOCS_DOWNLOAD",
        user: buildAuthUser({
          id: SECOND_AGENT_USER_ID,
          email: SECOND_AGENT_EMAIL,
          role: "simple",
        }),
      });

      expect(result).toEqual({ allowed: false, blockedNow: false });
      const secondStatus = await userStatusManager.getUserStatusFromDb({
        userProfile: "structure",
        userId: SECOND_AGENT_USER_ID,
      });
      expect(secondStatus).toBe("ACTIVE");
      expect(await recentBlockLogs()).toHaveLength(1);
    });
  });

  describe("USAGERS_DELETE", () => {
    const blockThreshold = () => domifaConfig().quotas.usagersDeleteBlockPerDay;

    it("blocks the crosser with reason=quota_usagers_delete", async () => {
      await seedAppLogs("USAGERS_DELETE", blockThreshold());

      const result = await service.enforceBeforeAction({
        action: "USAGERS_DELETE",
        user: buildAuthUser({
          id: FIRST_CROSSER_USER_ID,
          email: FIRST_CROSSER_EMAIL,
          role: "agent",
        }),
      });

      expect(result).toEqual({ allowed: false, blockedNow: true });
      const blocks = await recentBlockLogs();
      expect(blocks).toHaveLength(1);
      expect(blocks[0].context.reason).toBe("quota_usagers_delete");
      expect(blocks[0].context.kind).toBe("USAGERS_DELETE");
    });
  });
});
