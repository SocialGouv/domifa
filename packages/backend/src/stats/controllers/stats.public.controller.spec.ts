import { forwardRef, HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { InteractionsModule } from "../../modules/interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../util/test";
import { domifaConfig } from "../../config";
import { PublicStats } from "@domifa/common";
import { StatsPublicController } from "./stats.public.controller";
import { CacheModule } from "@nestjs/cache-manager";
import { PublicStatsService } from "../services/publicStats.service";

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
      const response = await supertest(context.app.getHttpServer()).get(
        "/stats/public-stats"
      );

      const retour: PublicStats = {
        actifs: 11,
        usagersCount: 20,
        usersCount: 10,
        structuresCount: 5,
        courrierInCount: 15,
        courrierOutCount: 2,
        structuresCountByRegion: [
          { count: 2, region: "52" },
          { count: 1, region: "03" },
          { count: 1, region: "11" },
          { count: 1, region: "75" },
        ],
        structuresCountByTypeMap: { asso: 2, cias: 2, ccas: 1 },
        interactionsCountByMonth: [
          { name: "août", value: 0 },
          { name: "sept.", value: 0 },
          { name: "oct.", value: 0 },
          { name: "nov.", value: 0 },
          { name: "déc.", value: 0 },
          { name: "janv.", value: 0 },
          { name: "févr.", value: 0 },
          { name: "mars", value: 0 },
          { name: "avr.", value: 0 },
          { name: "mai", value: 0 },
          { name: "juin", value: 0 },
          { name: "juil.", value: 0 },
        ],
        usagersCountByMonth: [
          { name: "août", value: 0 },
          { name: "sept.", value: 0 },
          { name: "oct.", value: 0 },
          { name: "nov.", value: 4 },
          { name: "déc.", value: 0 },
          { name: "janv.", value: 0 },
          { name: "févr.", value: 0 },
          { name: "mars", value: 1 },
          { name: "avr.", value: 0 },
          { name: "mai", value: 0 },
          { name: "juin", value: 0 },
          { name: "juil.", value: 0 },
        ],
      };

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(retour);
    });

    it("Should display stats for 'Pays de la Loire'", async () => {
      const response = await supertest(context.app.getHttpServer()).get(
        "/stats/public-stats/52"
      );

      const retour: PublicStats = {
        actifs: 11,
        usagersCount: 0,
        usersCount: 5,
        structuresCount: 2,
        courrierInCount: 0,
        courrierOutCount: 0,
        structuresCountByRegion: [
          {
            count: 2,
            region: "44",
          },
        ],
        structuresCountByTypeMap: {
          asso: 2,
          cias: 0,
          ccas: 0,
        },
        interactionsCountByMonth: [
          {
            name: "août",
            value: 0,
          },
          {
            name: "sept.",
            value: 0,
          },
          {
            name: "oct.",
            value: 0,
          },
          {
            name: "nov.",
            value: 0,
          },
          {
            name: "déc.",
            value: 0,
          },
          {
            name: "janv.",
            value: 0,
          },
          {
            name: "févr.",
            value: 0,
          },
          {
            name: "mars",
            value: 0,
          },
          {
            name: "avr.",
            value: 0,
          },
          {
            name: "mai",
            value: 0,
          },
          {
            name: "juin",
            value: 0,
          },
          {
            name: "juil.",
            value: 0,
          },
        ],
        usagersCountByMonth: [
          {
            name: "août",
            value: 0,
          },
          {
            name: "sept.",
            value: 0,
          },
          {
            name: "oct.",
            value: 0,
          },
          {
            name: "nov.",
            value: 0,
          },
          {
            name: "déc.",
            value: 0,
          },
          {
            name: "janv.",
            value: 0,
          },
          {
            name: "févr.",
            value: 0,
          },
          {
            name: "mars",
            value: 0,
          },
          {
            name: "avr.",
            value: 0,
          },
          {
            name: "mai",
            value: 0,
          },
          {
            name: "juin",
            value: 0,
          },
          {
            name: "juil.",
            value: 0,
          },
        ],
      };

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(retour);
    });
  });
});
