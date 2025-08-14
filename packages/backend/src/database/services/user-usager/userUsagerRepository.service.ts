import { UserUsagerWithUsagerInfo } from "@domifa/common";
import { PageOptionsDto } from "../../../usagers/dto";
import { UserUsagerTable } from "../../entities";
import { myDataSource } from "../_postgres";
import { UserStructureAuthenticated } from "../../../_common/model";

export const userUsagerRepository = myDataSource
  .getRepository(UserUsagerTable)
  .extend({
    async getAccountsWithUsagerInfo(
      currentUser: UserStructureAuthenticated,
      options?: PageOptionsDto,
      isExport = false
    ): Promise<{
      entities: UserUsagerWithUsagerInfo[];
      itemCount: number;
    }> {
      const queryBuilder = this.createQueryBuilder("user_usager")
        .leftJoinAndSelect(
          "usager",
          "usager",
          "user_usager.usagerUUID = usager.uuid"
        )
        .where("user_usager.structureId = :structureId", {
          structureId: currentUser.structureId,
        })
        .select([
          `user_usager.createdAt as "createdAt"`,
          `user_usager.updatedAt as "updatedAt"`,
          `user_usager.login as "login"`,
          `user_usager.isTemporaryPassword as "isTemporaryPassword"`,
          `user_usager.lastLogin as "lastLogin"`,
          `user_usager.passwordLastUpdate as "passwordLastUpdate"`,
          `user_usager.enabled as "enabled"`,
          `user_usager.isBirthDate as "isBirthDate"`,
          `usager.nom as "nom"`,
          `usager.prenom as "prenom"`,
          `usager.telephone as "telephone"`,
          `usager.dateNaissance as "dateNaissance"`,
        ]);
      const itemCount = await queryBuilder.getCount();

      if (isExport) {
        // Pour l'export, on prend tout avec une limite haute et on ordonne par dateInteraction
        queryBuilder.orderBy(`user_usager."createdAt"`, "DESC").limit(100000);
      }
      console.log({ options, isExport });
      if (options) {
        queryBuilder
          .orderBy("user_usager.createdAt", options.order)
          .offset((options.page - 1) * options.take)
          .limit(options.take);
      }

      const entities = await queryBuilder.getRawMany();

      return {
        entities,
        itemCount,
      };
    },
  });
