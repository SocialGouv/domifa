import { faker } from "@faker-js/faker";
import { appLogger } from "../../../../util";
import {
  Usager,
  UsagerAyantDroit,
  UsagerDecision,
} from "../../../../_common/model";
import {
  usagerDocsRepository,
  usagerEntretienRepository,
  usagerNotesRepository,
} from "../../usager";
import { usagerRepository } from "../../usager/usagerRepository.service";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUsagerAnonymizer = {
  anonymizeUsagers,
  anonymizeUsagerDecision,
  anonymizeAyantDroits,
  anonymizeEntretiens,
  anonymizeNotes,
  anonymizeUsagerDocs,
};

async function anonymizeUsagers() {
  const usagers = await usagerRepository.find({
    select: [
      "uuid",
      "ref",
      "structureId",
      "email",
      "historique",
      "prenom",
      "nom",
      "surnom",
      "rdv",
      "ayantsDroits",
      "datePremiereDom",
      "updatedAt",
      "decision",
    ],
  });

  const usagersToAnonymize = usagers.filter((x) => isUsagerToAnonymize(x));

  appLogger.warn(
    `[dataUsagerAnonymizer] ${usagersToAnonymize.length}/${usagers.length} usagers to anonymize`
  );
  for (let i = 0; i < usagersToAnonymize.length; i++) {
    const usager = usagersToAnonymize[i];
    if (i !== 0 && i % 5000 === 0) {
      appLogger.warn(
        `[dataUsagerAnonymizer] ${i}/${usagersToAnonymize.length} usagers anonymized`
      );
    }

    try {
      await _anonymizeUsager(usager);
    } catch (e) {
      console.log(e);
    }
  }
}

function isUsagerToAnonymize(x: Usager): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({ id: x.structureId });
}

async function _anonymizeUsager(usager: Usager) {
  let historique = [];

  if (usager.historique) {
    historique = usager.historique.map((h) => anonymizeUsagerDecision(h));
  }

  const attributesToUpdate: Partial<Usager> = {
    email: null,
    prenom: dataGenerator.firstName(),
    telephone: {
      countryCode: "fr",
      numero: "",
    },
    nom: dataGenerator.lastName(),
    surnom: null,
    villeNaissance: dataGenerator.fromList(["Inconnu", dataGenerator.city()]),
    decision: anonymizeUsagerDecision(usager.decision),
    historique,
    ayantsDroits: anonymizeAyantDroits(usager.ayantsDroits),
    rdv: {
      userId: faker.datatype.number(),
      userName: faker.name.fullName(),
      dateRdv: usager?.rdv?.dateRdv ?? null,
    },
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    return usager;
  }

  return usagerRepository.updateOne({ uuid: usager.uuid }, attributesToUpdate);
}
function anonymizeAyantDroits(
  ayantsDroits: UsagerAyantDroit[]
): UsagerAyantDroit[] {
  return (ayantsDroits ?? []).map((x) => ({
    lien: x.lien,
    nom: dataGenerator.lastName(),
    prenom: dataGenerator.firstName(),
    dateNaissance: x.dateNaissance,
  }));
}

function anonymizeUsagerDecision(decision: UsagerDecision): UsagerDecision {
  return {
    ...decision,
    motifDetails: null,
    orientationDetails: null,
    userName: faker.name.fullName(),
    userId: faker.datatype.number(),
    uuid: faker.datatype.uuid(),
  };
}

async function anonymizeEntretiens() {
  appLogger.warn(
    `[dataAnonymizeEntretiens] Nettoyage du contenu des entretiens`
  );

  await usagerEntretienRepository.update(
    {},
    {
      commentaires: null,
      revenusDetail: null,
      orientationDetail: null,
      liencommuneDetail: null,
      residenceDetail: null,
      causeDetail: null,
      raisonDetail: null,
      accompagnementDetail: null,
    }
  );
}

async function anonymizeNotes() {
  appLogger.warn(`[anonymizeNotes] Nettoyage du contenu des notes`);

  await usagerNotesRepository.update(
    {},
    {
      message: faker.lorem.sentence(),
      createdBy: {
        userId: faker.datatype.number(),
        userName: faker.name.fullName(),
      },
    }
  );
}

async function anonymizeUsagerDocs() {
  appLogger.warn(`[anonymizeNotes] Nettoyage du contenu des notes`);

  await usagerDocsRepository.update(
    {},
    {
      label: faker.lorem.sentence(3),
      createdBy: faker.name.fullName(),
    }
  );
}
