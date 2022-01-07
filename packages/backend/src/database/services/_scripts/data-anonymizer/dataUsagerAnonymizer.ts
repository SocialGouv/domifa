import { INestApplication } from "@nestjs/common";
import { usagerHistoryRepository } from "../..";
import { appLogger } from "../../../../util";
import {
  Usager,
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
} from "../../../../_common/model";
import { usagerRepository } from "../../usager/usagerRepository.service";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUsagerAnonymizer = {
  anonymizeUsagers,
  anonymizeUsagerEntretien,
  anonymizeUsagerDecision,
  anonymizeUsagerHistorique,
  anonymizeAyantDroits,
};

async function anonymizeUsagers({ app }: { app: INestApplication }) {
  appLogger.warn(`[ANON] [usagerHistoryRepository] reset tables`);
  await usagerHistoryRepository.deleteByCriteria({});

  const usagers = await usagerRepository.findMany(
    {},
    {
      select: [
        "uuid",
        "ref",
        "structureId",
        "email",
        "prenom",
        "nom",
        "surnom",
        "dateNaissance",
        "ayantsDroits",
        "datePremiereDom",
        "entretien",
        "updatedAt",
        "decision",
      ],
    }
  );

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
      await _anonymizeUsager(usager, { app });
    } catch (e) {
      console.log(e);
    }
  }
}
function isUsagerToAnonymize(x: Usager): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({ id: x.structureId });
}

async function _anonymizeUsager(
  usager: Usager,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUsagerAnonymizer] check usager "${usager.ref}"`);

  usager.entretien.commentaires = null;
  usager.entretien.revenusDetail = null;
  usager.entretien.raisonDetail = null;
  usager.entretien.orientationDetail = null;

  let historique = [];
  let docs = [];

  if (usager.historique) {
    historique = usager.historique.map((h) => anonymizeUsagerHistorique(h));
  }

  if (usager.docs) {
    docs = usager.docs.map((d, i) => ({
      ...d,
      label: `Document ${i}`,
    }));
  }

  const attributesToUpdate: Partial<Usager> = {
    email: null,
    prenom: dataGenerator.firstName(),
    phone: null,
    preference: {
      email: false,
      phone: false,
      phoneNumber: null,
    },
    nom: dataGenerator.lastName(),
    surnom: null,
    dateNaissance: dataGenerator.date({
      years: { min: 18, max: -90 },
    }),
    villeNaissance: dataGenerator.fromList(["Inconnu", dataGenerator.city()]),
    entretien: anonymizeUsagerEntretien(usager.entretien),
    decision: anonymizeUsagerDecision(usager.decision),
    historique,
    ayantsDroits: anonymizeAyantDroits(usager.ayantsDroits),
    docs,
    docsPath: [],
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUsagerAnonymizer] nothing to update for "${usager.ref}"`);
    return usager;
  }

  return await usagerRepository.updateOne(
    { uuid: usager.uuid },
    attributesToUpdate
  );
}
function anonymizeAyantDroits(
  ayantsDroits: UsagerAyantDroit[]
): UsagerAyantDroit[] {
  return (ayantsDroits ?? []).map((x) => ({
    lien: x.lien,
    nom: dataGenerator.lastName(),
    prenom: dataGenerator.firstName(),
    dateNaissance: dataGenerator.date({
      years: { min: 0, max: -90 },
    }),
  }));
}

function anonymizeUsagerHistorique(h: UsagerDecision): UsagerDecision {
  return {
    ...h,
    motifDetails: null,
    orientationDetails: null,
  };
}

function anonymizeUsagerDecision(decision: UsagerDecision): UsagerDecision {
  return {
    ...decision,
    motifDetails: null,
    orientationDetails: null,
  };
}

function anonymizeUsagerEntretien(entretien: UsagerEntretien): UsagerEntretien {
  return {
    ...entretien,
    commentaires: null,
    revenusDetail: null,
    orientationDetail: null,
    liencommuneDetail: null,
    residenceDetail: null,
    causeDetail: null,
    raisonDetail: null,
    accompagnementDetail: null,
  };
}
