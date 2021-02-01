import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test/AppTestHelper.service";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository advanced base", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  // TODO @toub isoler les bdd de test pour pouvoir décommenter ça (car perturbé par le test d'import par exemple)
  // it("countDomiciliations (ALL)", async () => {
  //   const count = await usagerRepository.countDomiciliations({});
  //   expect(count).toEqual(6);
  // });
  it("countDomiciliations (dateNaissance)", async () => {
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        dateNaissance: {
          min: new Date(Date.UTC(1960, 1, 1)),
        },
      })
    ).toEqual(4);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        dateNaissance: {
          max: new Date(Date.UTC(1960, 1, 1)),
        },
      })
    ).toEqual(2);
  });
  it("countDomiciliations (entretien)", async () => {
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          residence: "HEBERGEMENT_TIERS",
        },
      })
    ).toEqual(2);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          residence: "NON_RENSEIGNE",
        },
      })
    ).toEqual(3);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          cause: "VIOLENCE",
        },
      })
    ).toEqual(1);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          cause: "NON_RENSEIGNE",
        },
      })
    ).toEqual(3);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          typeMenage: "FEMME_ISOLE_AVEC_ENFANT",
        },
      })
    ).toEqual(1);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
        entretien: {
          typeMenage: "NON_RENSEIGNE",
        },
      })
    ).toEqual(4);
  });
  // TODO @toub isoler les bdd de test pour pouvoir décommenter ça (car perturbé par le test d'import par exemple)
  // it(" (ALL)", async () => {
  //   const count = await usagerRepository.countAyantsDroits({});
  //   expect(count).toEqual(5);
  // });

  it("countDomiciliations (by structureId)", async () => {
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 1,
      })
    ).toEqual(6);
    expect(
      await usagerRepository.countDomiciliations({
        structureId: 2,
      })
    ).toEqual(0);
  });
});
