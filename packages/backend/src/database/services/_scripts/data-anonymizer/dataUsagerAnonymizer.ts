import { INestApplication } from "@nestjs/common";
import { appLogger } from "../../../../util";
import { Usager } from "../../../../_common/model";
import { usagerRepository } from "../../usager/usagerRepository.service";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUsagerAnonymizer = {
  anonymizeUsagers,
};

async function anonymizeUsagers({ app }: { app: INestApplication }) {
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
    await _anonymizeUsager(usager, { app });
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

  const attributesToUpdate: Partial<Usager> = {
    email: `usager-${usager.ref}@domifa-fake.fabrique.social.gouv.fr`,
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
    entretien: usager.entretien,
    ayantsDroits: usager.ayantsDroits
      ? usager.ayantsDroits.map((x) => ({
          lien: x.lien,
          nom: dataGenerator.lastName(),
          prenom: dataGenerator.firstName(),
          dateNaissance: dataGenerator.date({
            years: { min: 0, max: -90 },
          }),
        }))
      : usager.ayantsDroits,
    datePremiereDom: dataGenerator.date({
      years: { min: 0, max: -30 },
    }),
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUsagerAnonymizer] nothing to update for "${usager.ref}"`);
    return usager;
  }

  return usagerRepository.updateOne({ uuid: usager.uuid }, attributesToUpdate);
}
