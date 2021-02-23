import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { structureStatsRepository } from "./structureStatsRepository.service";

describe("structureStatsRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findByStructureIdAndDate", async () => {
    const stats = await structureStatsRepository.findByStructureIdAndDate({
      structureId: 1,
      statsDateUTC: new Date(Date.UTC(2020, 12 - 1, 30)),
    });
    expect(stats).toBeUndefined();

    const stats2 = await structureStatsRepository.findByStructureIdAndDate({
      structureId: 3,
      statsDateUTC: new Date(Date.UTC(2020, 11 - 1, 16)),
    });
    expect(stats2).toBeDefined();
    expect(stats2).toBeDefined();
    // Note: Date is not UTC
    expect(stats2.date.getFullYear()).toEqual(2020);
    expect(stats2.date.getMonth()).toEqual(11 - 1);
    expect(stats2.date.getDate()).toEqual(16);
    expect(stats2.structureId).toEqual(3);
  });
});
