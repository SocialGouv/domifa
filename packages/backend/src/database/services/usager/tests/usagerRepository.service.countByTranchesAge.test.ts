import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository countByTranchesAge", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("countByTranchesAge (actives by structureId)", async () => {
    {
      const statsDate = new Date(Date.UTC(2020, 15, 0));
      expect(
        await usagerRepository.countByTranchesAge({
          structureId: 1,
          actifsInHistoryBefore: statsDate,
          ageReferenceDate: statsDate,
        })
      ).toEqual({
        T_0_14: 0,
        T_15_19: 0,
        T_20_24: 1,
        T_25_29: 0,
        T_30_34: 1,
        T_35_39: 0,
        T_40_44: 1,
        T_45_49: 0,
        T_50_54: 0,
        T_55_59: 0,
        T_60_64: 0,
        T_65_69: 0,
        T_70_74: 0,
        T_75_PLUS: 0,
      });
    }
    {
      const statsDate = new Date(Date.UTC(2019, 15, 0));
      expect(
        await usagerRepository.countByTranchesAge({
          structureId: 1,
          actifsInHistoryBefore: statsDate,
          ageReferenceDate: statsDate,
        })
      ).toEqual({
        T_0_14: 0,
        T_15_19: 0,
        T_20_24: 1,
        T_25_29: 0,
        T_30_34: 0,
        T_35_39: 0,
        T_40_44: 1,
        T_45_49: 0,
        T_50_54: 0,
        T_55_59: 0,
        T_60_64: 0,
        T_65_69: 0,
        T_70_74: 0,
        T_75_PLUS: 0,
      });
    }
  });
});
