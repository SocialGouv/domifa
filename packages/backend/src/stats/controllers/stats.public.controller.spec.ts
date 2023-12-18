import { forwardRef, HttpStatus } from "@nestjs/common";
import supertest from "supertest";

import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../util/test";
import { AdminStructuresModule } from "../../_portail-admin/admin-structures/admin-structures.module";
import { StatsPublicController } from "./stats.public.controller";
import { domifaConfig } from "../../config";
import { HomeStats, PublicStats } from "@domifa/common";

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
        forwardRef(() => AdminStructuresModule),
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [],
    });
    controller = context.module.get<StatsPublicController>(
      StatsPublicController
    );
  });

  it("Stats HomePage", async () => {
    const response = await supertest(context.app.getHttpServer()).get(
      "/stats/home"
    );

    expect(response.status).toBe(HttpStatus.OK);

    const content = response.body as HomeStats;
    expect(content.interactions).toEqual(5);
    expect(content.structures).toEqual(5);
    expect(content.usagers).toEqual(20);
  });

  it("Stats Page : national", async () => {
    const response = await supertest(context.app.getHttpServer()).get(
      "/stats/public-stats"
    );

    const retour: PublicStats = {
      usagersCount: 20,
      usersCount: 10,
      structuresCount: 5,
      courrierInCount: 5,
      courrierOutCount: 2,
      structuresCountByRegion: [
        { count: 2, region: "52" },
        { count: 1, region: "03" },
        { count: 1, region: "11" },
        { count: 1, region: "75" },
      ],
      structuresCountByTypeMap: { asso: 2, cias: 2, ccas: 1, mairie: 0 },
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

  it("Statistiques régionales : Pays de la Loire", async () => {
    const response = await supertest(context.app.getHttpServer()).get(
      "/stats/public-stats/52"
    );

    const retour: PublicStats = {
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
        mairie: 0,
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
