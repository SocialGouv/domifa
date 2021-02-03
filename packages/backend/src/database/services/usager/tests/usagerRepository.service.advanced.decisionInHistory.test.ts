import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository advanced decisionInHistory", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("decisionInHistory (HISTORIQUE + structureId)", async () => {
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        decisionInHistory: {
          dateDebutBefore: new Date(Date.UTC(2021, 15, 0)),
          statut: "REFUS",
          motif: "SATURATION",
        },
      })
    ).toEqual(1);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        decisionInHistory: {
          dateDecisionBefore: new Date(Date.UTC(2020, 2, 6)),
          statut: "INSTRUCTION",
        },
      })
    ).toEqual(1);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        decisionInHistory: {
          dateDecisionBefore: new Date(Date.UTC(2021, 15, 0)),
          statut: "INSTRUCTION",
        },
      })
    ).toEqual(2);
  });
  // TODO @toub LATER créer plus de données via l'appli et ajouter des tests
  // it("decisionInHistory (VALIDE + motif/orientation)", async () => {
  //   const count = await usagerRepository.countDomiciliations({
  //     decisionInHistory: {
  //       dateDecisionBefore: new Date(Date.UTC(2020, 15, 0)),
  //       statut: "INSTRUCTION",
  //       motif: "A_SA_DEMANDE",
  //       orientation: "asso",
  //     },
  //   });
  //   expect(count).toEqual(3);
  // });
});
