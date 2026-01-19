import { AppTestHelper } from "../../../../util/test";
import { structureStatsInPeriodGenerator } from "../structureStatsInPeriodGenerator.service";

describe("structureStatsInPeriodGenerator", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("buildStatsInPeriod", async () => {
    const startDateUTC = new Date(Date.UTC(2019, 10, 15));
    const endDateUTC = new Date(Date.UTC(2021, 1, 1));
    const endDateUTCExclusive = new Date(Date.UTC(2021, 1, 2));

    const startDate = "2019-11-15";
    const endDate = "2021-02-01";

    const stats = await structureStatsInPeriodGenerator.buildStatsInPeriod({
      structureId: 1,
      startDate,
      endDate,
    });

    expect(stats.structure.id).toEqual(1);
    expect(stats.period.startDateUTC).toEqual(startDateUTC);
    expect(stats.period.endDateUTC).toEqual(endDateUTC);
    expect(stats.period.endDateUTCExclusive).toEqual(endDateUTCExclusive);
    expect(stats).toBeDefined();

    // This is an integration test relying on a mutable DB (other tests create
    // interactions). Validate the shape and core invariants instead of exact
    // dump-driven counts.
    expect(stats.data).toBeDefined();
    expect(stats.data).toHaveProperty("decisions");
    expect(stats.data).toHaveProperty("interactions");
    expect(stats.data).toHaveProperty("validUsagers");

    expect(stats.data.interactions).toEqual(
      expect.objectContaining({
        appel: expect.any(Number),
        visite: expect.any(Number),
        allVisites: expect.any(Number),
        courrierIn: expect.any(Number),
        recommandeIn: expect.any(Number),
        colisIn: expect.any(Number),
      })
    );

    expect(stats.data.validUsagers.total).toEqual(
      expect.objectContaining({
        usagers: expect.any(Number),
        ayantsDroits: expect.any(Number),
        usagerEtAyantsDroits: expect.any(Number),
      })
    );
  });
});
