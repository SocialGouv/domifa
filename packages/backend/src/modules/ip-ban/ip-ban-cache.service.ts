import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { appIpBanRepository } from "../../database";
import {
  AppIpBanReason,
  AppIpBanTable,
} from "../../database/entities/app-ip-ban/AppIpBanTable.typeorm";
import { appLogger } from "../../util";

@Injectable()
export class IpBanCacheService implements OnModuleInit {
  private cache = new Map<string, AppIpBanTable>();

  public async onModuleInit(): Promise<void> {
    await this.refresh("boot");
  }

  public isBanned(ip: string): boolean {
    if (!ip) {
      return false;
    }
    const ban = this.cache.get(ip);
    if (!ban) {
      return false;
    }
    if (ban?.expiresAt && ban?.expiresAt.getTime() <= Date.now()) {
      this.cache.delete(ip);
      return false;
    }
    return true;
  }

  public getBan(ip: string): AppIpBanTable | null {
    if (!this.isBanned(ip)) {
      return null;
    }
    return this.cache.get(ip) ?? null;
  }

  public async banIp(params: {
    ip: string;
    reason: AppIpBanReason;
    expiresAt?: Date | null;
    context?: Record<string, unknown> | null;
    createdBy?: string | null;
  }): Promise<void> {
    if (!params.ip) {
      return;
    }
    const persisted = await appIpBanRepository.save(
      new AppIpBanTable({
        ip: params.ip,
        reason: params.reason,
        expiresAt: params.expiresAt ?? null,
        context: (params.context ?? null) as any,
        createdBy: params.createdBy ?? null,
      })
    );
    this.cache.set(persisted.ip, persisted);
  }

  public async unbanIp(ip: string): Promise<void> {
    if (!ip) {
      return;
    }
    await appIpBanRepository.delete({ ip });
    this.cache.delete(ip);
  }

  public size(): number {
    return this.cache.size;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  public async refreshFromCron(): Promise<void> {
    await this.refresh("cron");
  }

  private async refresh(trigger: "boot" | "cron"): Promise<void> {
    try {
      const bans = await appIpBanRepository
        .createQueryBuilder("ban")
        .where(`ban."expiresAt" IS NULL OR ban."expiresAt" > NOW()`)
        .orderBy(`ban."createdAt"`, "ASC")
        .getMany();
      // Iterating ASC then `set()` means the most recent ban wins for a given IP.
      const next = new Map<string, AppIpBanTable>();
      for (const ban of bans) {
        next.set(ban.ip, ban);
      }
      this.cache = next;
      appLogger.info({
        event: "ip_ban_cache_refreshed",
        trigger,
        banCount: this.cache.size,
      });
    } catch (err) {
      appLogger.error("[ipBanCache] refresh failed", {
        sentry: true,
        context: { trigger, error: (err as Error).message },
      });
    }
  }
}
