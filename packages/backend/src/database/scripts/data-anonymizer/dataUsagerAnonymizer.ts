import { INestApplication } from "@nestjs/common";
import { Model } from "mongoose";
import { Usager } from "../../../usagers/interfaces/usagers";
import { appLogger } from "../../../util";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";

export const dataUsagerAnonymizer = {
  anonymizeUsagers,
};

async function anonymizeUsagers({ app }: { app: INestApplication }) {
  const usagerModel: Model<Usager> = app.get("USAGER_MODEL");
  const usagers = await usagerModel.find({}).select("id email");

  const usagersToAnonymize = usagers.filter((x) =>
    dataEmailAnonymizer.isEmailToAnonymize(x.email)
  );

  appLogger.warn(
    `[dataUsagerAnonymizer] ${usagersToAnonymize.length}/${usagers.length} usagers to update`
  );
  for (const usager of usagersToAnonymize) {
    await _anonymizeUsager(usager, { app });
  }
}
async function _anonymizeUsager(
  usager: Usager,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUsagerAnonymizer] check usager "${usager._id}"`);

  const usagerModel: Model<Usager> = app.get("USAGER_MODEL");

  const attributesToUpdate = {
    email: `usager-${usager.id}@domifa-fake.fabrique.social.gouv.fr`,
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUsagerAnonymizer] nothing to update for "${usager._id}"`);

    return usager;
  }

  return usagerModel
    .findOneAndUpdate({ _id: usager._id }, { $set: attributesToUpdate })
    .exec();
}
