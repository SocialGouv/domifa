import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository advanced actifsInHistoryBefore", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  // TODO @toub isoler les bdd de test pour pouvoir décommenter ça (car perturbé par le test d'import par exemple)
  // it("countDomiciliations (ALL ACTIVES)", async () => {
  //   const count = await usagerRepository.countDomiciliations({
  //     structureId: 1,
  //     actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
  //   });
  //   expect(count).toEqual(3);
  // });

  // it("countAyantsDroits (ALL ACTIVES)", async () => {
  //   const count = await usagerRepository.countAyantsDroits({
  //     structureId: 1,
  //     actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
  //   });
  //   expect(count).toEqual(4);
  // });

  it("countDomiciliations (actives by structureId)", async () => {
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
      })
    ).toEqual(3);
    expect(
      await usagerRepository.countDomiciliations({
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
        structureId: 2,
      })
    ).toEqual(0);
  });

  it("countAyantsDroits (actives by structureId)", async () => {
    expect(
      await usagerRepository.countAyantsDroits({
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
        structureId: 1,
      })
    ).toEqual(4);
    expect(
      await usagerRepository.countAyantsDroits({
        actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
        structureId: 2,
      })
    ).toEqual(0);
  });

  it("countDomiciliations (actives by typeDom=RENOUVELLEMENT')", async () => {
    const count = await usagerRepository.countDomiciliations({
      structureId: 1,
      typeDom: "RENOUVELLEMENT",
      actifsInHistoryBefore: new Date(Date.UTC(2020, 15, 0)),
    });
    expect(count).toEqual(1);
  });
});
