import { fakerFR as faker } from "@faker-js/faker";

import { appLogger } from "../../../../util";
import {
  Usager,
  UsagerAyantDroit,
  UsagerDecision,
  UsagerOptions,
} from "../../../../_common/model";
import {
  usagerDocsRepository,
  usagerEntretienRepository,
  usagerNotesRepository,
  usagerOptionsHistoryRepository,
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
  anonymizeOptions,
  anonymizeOptionsHistory,
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
      "options",
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
  const options = anonymizeOptions(usager);

  const attributesToUpdate: Partial<Usager> = {
    email: null,
    prenom: dataGenerator.firstName(),
    telephone: {
      countryCode: "fr",
      numero: "",
    },
    pinnedNote: null,
    nom: dataGenerator.lastName(),
    surnom: usager.surnom ? dataGenerator.lastName() : null,
    villeNaissance: dataGenerator.city(),
    decision: anonymizeUsagerDecision(usager.decision),
    historique,
    ayantsDroits: anonymizeAyantDroits(usager.ayantsDroits),
    import: usager?.import
      ? {
          date: usager.import.date,
          userId: dataGenerator.number(),
          userName: faker.person.fullName(),
        }
      : null,
    rdv: usager?.rdv
      ? {
          userId: dataGenerator.number(),
          userName: faker.person.fullName(),
          dateRdv: usager?.rdv?.dateRdv ?? null,
        }
      : null,
    options,
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
    userName: faker.person.fullName(),
    userId: dataGenerator.number(),
    uuid: faker.string.uuid(),
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
    {
      archived: false,
    },
    {
      message: faker.lorem.sentence(5),
      createdBy: {
        userId: dataGenerator.number(),
        userName: faker.person.fullName(),
      },
      archivedBy: null,
    }
  );

  await usagerNotesRepository.update(
    {
      archived: true,
    },
    {
      message: faker.lorem.sentence(5),
      createdBy: {
        userId: dataGenerator.number(),
        userName: faker.person.fullName(),
      },
      archivedBy: {
        userId: dataGenerator.number(),
        userName: faker.person.fullName(),
      },
    }
  );
}

async function anonymizeUsagerDocs() {
  appLogger.warn(`[anonymizeNotes] Nettoyage du contenu des Documents`);

  return usagerDocsRepository.update(
    {},
    {
      label: faker.lorem.sentence(2),
      encryptionContext: null,
      encryptionVersion: null,
      createdBy: faker.person.fullName(),
    }
  );
}

function anonymizeOptions(usager: Usager): UsagerOptions {
  const procurations = (usager.options.procurations ?? []).map((x) => ({
    nom: dataGenerator.lastName(),
    prenom: dataGenerator.firstName(),
    dateNaissance: x.dateNaissance,
    dateFin: x.dateFin,
    dateDebut: x.dateDebut,
  }));

  const transfert =
    usager.options.transfert || usager.options.transfert?.actif
      ? {
          actif: true,
          nom: dataGenerator.lastName(),
          adresse: faker.location.streetAddress(),
          dateDebut: usager.options.transfert.dateDebut,
          dateFin: usager.options.transfert.dateFin,
        }
      : {
          actif: false,
          nom: null,
          adresse: null,
          dateDebut: null,
          dateFin: null,
        };

  return {
    ...usager.options,
    transfert,
    procurations,
  };
}

async function anonymizeOptionsHistory() {
  const optionsToUpdate = await usagerOptionsHistoryRepository.count();

  appLogger.warn(
    `[dataUsagerAnonymizer] ${optionsToUpdate} transfert et procuration à nettoyer`
  );

  await usagerOptionsHistoryRepository.update(
    {},
    {
      userName: faker.person.fullName(),
      nom: faker.person.lastName(),
      adresse: faker.location.streetAddress(),
      prenom: faker.person.firstName(),
    }
  );
}
