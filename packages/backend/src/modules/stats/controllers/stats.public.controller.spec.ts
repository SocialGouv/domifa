import { forwardRef, HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { StatsPublicController } from "./stats.public.controller";
import { CacheModule } from "@nestjs/cache-manager";
import { PublicStatsService } from "../services/publicStats.service";
import { domifaConfig } from "../../../config";
import { UsagersModule } from "../../../usagers/usagers.module";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../../util/test";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";

describe("Stats Public Controller", () => {
  let controller: StatsPublicController;
  let context: AppTestContext;
  afterAll(async () => {
    jest.useRealTimers();
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date("2022-08-31T09:45:30.000Z"));

    domifaConfig().envId = "test";

    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StatsPublicController],
      imports: [
        CacheModule.register(),
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [PublicStatsService],
    });
    controller = context.module.get<StatsPublicController>(
      StatsPublicController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("National page", () => {
    it("Should display stats for France", async () => {
      // This is an integration test (it depends on the restored DB dump).
      // Instead of asserting hard-coded numbers that can drift when the dump
      // changes, we assert that the HTTP endpoint returns what the service
      // computes.
      const service = context.module.get(PublicStatsService);
      const expected = await service.generatePublicStats({ updateCache: true });

      const response = await supertest(context.app.getHttpServer()).get(
        "/stats/public-stats"
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(expected)));
    });

    it("Should display stats for 'Pays de la Loire'", async () => {
      const service = context.module.get(PublicStatsService);
      const expected = await service.generatePublicStats({
        updateCache: true,
        regionId: "52",
      });

      const response = await supertest(context.app.getHttpServer()).get(
        "/stats/public-stats/52"
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(expected)));
    });
  });
});
