import { INestApplication } from "@nestjs/common";
import { appLogger } from "../../../../util";
import { UsagerPG } from "../../../entities";
import { usagerRepository } from "../../usager/usagerRepository.service";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import moment = require("moment");

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
function isUsagerToAnonymize(x: UsagerPG): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({ id: x.structureId });
}

async function _anonymizeUsager(
  usager: UsagerPG,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUsagerAnonymizer] check usager "${usager.ref}"`);

  const attributesToUpdate: Partial<UsagerPG> = {
    email: `usager-${usager.ref}@domifa-fake.fabrique.social.gouv.fr`,
    prenom: dataGenerator.firstName(),
    nom: dataGenerator.lastName(),
    surnom: null,
    dateNaissance: dataGenerator.date({
      years: { min: 18, max: -90 },
    }),
    ayantsDroits: usager.ayantsDroits
      ? usager.ayantsDroits.map((x) => ({
          lien: x.lien,
          nom: dataGenerator.lastName(),
          prenom: dataGenerator.firstName(),
          dateNaissance: moment(
            dataGenerator.date({
              years: { min: 0, max: -90 },
            })
          ).format("DD/MM/yyyy"),
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
