import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository countByRaisonDemande", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("countByRaisonDemande (actives by structureId)", async () => {
    expect(
      await usagerRepository.countByRaisonDemande({
        structureId: 1,
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
      })
    ).toEqual({
      AUTRE: 1,
      EXERCICE_DROITS: 1,
      PRESTATIONS_SOCIALES: 0,
    });
    expect(
      await usagerRepository.countByRaisonDemande({
        structureId: 1,
        actifsInHistoryBefore: new Date(Date.UTC(2019, 15, 0)),
      })
    ).toEqual({
      AUTRE: 1,
      EXERCICE_DROITS: 0,
      PRESTATIONS_SOCIALES: 0,
    });
    expect(
      await usagerRepository.countByRaisonDemande({
        structureId: 2,
        actifsInHistoryBefore: new Date(Date.UTC(2019, 15, 0)),
      })
    ).toEqual({
      AUTRE: 0,
      EXERCICE_DROITS: 0,
      PRESTATIONS_SOCIALES: 0,
    });
  });
});
