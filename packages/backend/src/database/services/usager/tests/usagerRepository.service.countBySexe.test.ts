import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository countBySexe", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("_countBySexe (actives by structureId)", async () => {
    expect(
      await usagerRepository.countBySexe({
        structureId: 1,
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
      })
    ).toEqual({ F: 1, H: 2 });
    expect(
      await usagerRepository.countBySexe({
        structureId: 1,
        actifsInHistoryBefore: new Date(Date.UTC(2019, 15, 0)),
      })
    ).toEqual({ F: 1, H: 1 });
    expect(
      await usagerRepository.countBySexe({
        structureId: 2,
        actifsInHistoryBefore: new Date(Date.UTC(2019, 15, 0)),
      })
    ).toEqual({ F: 0, H: 0 });
  });
});
