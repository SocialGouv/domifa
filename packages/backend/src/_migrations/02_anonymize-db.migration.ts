import { INestApplication } from "@nestjs/common";
import { Model } from "mongoose";
import { configService } from "../config/config.service";
import { Structure } from "../structures/structure-interface";
import { Usager } from "../usagers/interfaces/usagers";
import { User } from "../users/user.interface";
import { appLogger } from "../util";
import { processUtil } from "../util/processUtil.service";

const migrationName = __filename;

async function up(app: INestApplication) {
  appLogger.debug(`[${migrationName}] UP`);
  const envId = configService.getEnvId();
  if (envId === "dev" || envId === "preprod") {
    appLogger.warn(`[${migrationName}] DB anonymisation ON (env:${envId})`);
    await _anonymizeStructures({ app });
    await _anonymizeUsers({ app });
    await _anonymizeUsagers({ app });
  } else {
    appLogger.warn(`[${migrationName}] DB anonymisation OFF (env:${envId})`);
  }
}

async function _anonymizeStructures({ app }: { app: INestApplication }) {
  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");
  return structureModel
    .find({})
    .select("id email")
    .then(async (structures) => {
      appLogger.warn(
        `[${migrationName}] ${structures.length} structures to update`
      );
      structures = structures.filter((x) => _isEmailToAnonymize(x.email));
      if (structures.length === 0) {
        return;
      }

      return processUtil.processOneByOnePromise(
        structures,
        (structure: Structure) => _anonymizeStructure(structure, { app })
      );
    });
}

async function _anonymizeStructure(
  structure: Structure,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[${migrationName}] check structure "${structure._id}"`);

  const structureModel: Model<Structure> = app.get("STRUCTURE_MODEL");

  const attributesToUpdate = {
    email: `structure-${structure.id}@domifa-fake.fabrique.social.gouv.fr`,
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[${migrationName}] nothing to update for "${structure._id}"`);

    return structure;
  }

  return structureModel.findOneAndUpdate(
    { _id: structure._id },
    { $set: attributesToUpdate }
  );
}

async function _anonymizeUsers({ app }: { app: INestApplication }) {
  const userModel: Model<User> = app.get("USER_MODEL");
  return userModel
    .find({})
    .select("id email")
    .then((users) => {
      appLogger.warn(`[${migrationName}] ${users.length} users to update`);
      users = users.filter((x) => _isEmailToAnonymize(x.email));
      if (users.length === 0) {
        return;
      }

      return processUtil.processOneByOnePromise(users, (user: User) =>
        _anonymizeUser(user, { app })
      );
    });
}
async function _anonymizeUser(user: User, { app }: { app: INestApplication }) {
  // appLogger.debug(`[${migrationName}] check user "${user._id}"`);

  const userModel: Model<User> = app.get("USER_MODEL");

  const attributesToUpdate = {
    email: `user-${user.id}@domifa-fake.fabrique.social.gouv.fr`,
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[${migrationName}] nothing to update for "${user._id}"`);

    return user;
  }

  return userModel
    .findOneAndUpdate({ _id: user._id }, { $set: attributesToUpdate })
    .exec();
}
async function _anonymizeUsagers({ app }: { app: INestApplication }) {
  const usagerModel: Model<Usager> = app.get("USAGER_MODEL");
  return usagerModel
    .find({})
    .select("id email")
    .then((usagers) => {
      appLogger.warn(`[${migrationName}] ${usagers.length} usagers to update`);
      usagers = usagers.filter((x) => _isEmailToAnonymize(x.email));
      if (usagers.length === 0) {
        return;
      }

      return processUtil.processOneByOnePromise(usagers, (usager: Usager) =>
        _anonymizeUsager(usager, { app })
      );
    });
}
async function _anonymizeUsager(
  usager: Usager,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[${migrationName}] check usager "${usager._id}"`);

  const usagerModel: Model<Usager> = app.get("USAGER_MODEL");

  const attributesToUpdate = {
    email: `usager-${usager.id}@domifa-fake.fabrique.social.gouv.fr`,
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[${migrationName}] nothing to update for "${usager._id}"`);

    return usager;
  }

  return usagerModel
    .findOneAndUpdate({ _id: usager._id }, { $set: attributesToUpdate })
    .exec();
}

async function down(app: INestApplication) {
  appLogger.debug(`[${migrationName}] DOWN`);
  // await of(undefined).toPromise();
}

function _isEmailToAnonymize(email: string): boolean {
  return (
    !!email &&
    email !== "" &&
    !email.includes("@yopmail.com") &&
    !email.includes("@fabrique.social.gouv.fr")
  );
}

export { up, down };
