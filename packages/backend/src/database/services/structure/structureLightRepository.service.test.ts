import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { structureLightRepository } from "./structureLightRepository.service";

describe("structureLightRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findStructuresToGenerateStats", async () => {
    const structures = await structureLightRepository.findStructuresToGenerateStats(
      {
        statsDateUTC: new Date(Date.UTC(2021, 2, 1)),
      }
    );
    expect(structures.length).toEqual(4);
  });
});
