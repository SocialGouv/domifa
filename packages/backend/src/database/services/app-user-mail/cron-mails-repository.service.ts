import { AppUser, UserRole } from "../../../_common/model";
import { AppUserTable } from "../../entities";
import {
  appTypeormManager,
  postgresQueryBuilder,
} from "../../services/_postgres";
import { usersRepository } from "../app-user/usersRepository.service";

export type CronMailType = "guide" | "import";

export const cronMailsRepository = {
  updateMailFlag,
  findUsersToSendCronMail,
};

async function updateMailFlag({
  userId,
  mailType,
  value,
}: {
  userId: number;
  mailType: CronMailType;
  value: boolean;
}) {
  const query = `
      UPDATE app_user
      SET mails = mails || jsonb_build_object('${mailType}', ${value})
      WHERE id=${userId};
    ;`;

  const updateCount: number = await appTypeormManager
    .getRepository(AppUserTable)
    .query(query);

  return updateCount;
}

async function findUsersToSendCronMail({
  maxCreationDate,
  structuresIds,
  mailType,
}: {
  maxCreationDate: Date;
  structuresIds: number[] | undefined; // undefined if not used
  mailType: CronMailType;
}): Promise<Pick<AppUser, "id" | "role" | "email" | "nom" | "prenom">[]> {
  const maxCreationDateString = postgresQueryBuilder.formatPostgresDate(
    maxCreationDate
  );

  const whereClausesAnd = [
    `"createdAt" <= (:maxCreationDateString)::timestamp at time zone 'Europe/Paris'`,
    `(mails->>:mailType)::boolean = false`,
  ];
  const params: { [attr: string]: any } = {
    maxCreationDateString,
    mailType,
  };
  if (structuresIds && structuresIds.length) {
    whereClausesAnd.push(`"structureId" = ANY(:structuresIds)`);
    params["structuresIds"] = structuresIds;
  }

  if (structuresIds && structuresIds.length) {
    const roles: UserRole[] = ["admin", "facteur", "responsable"];
    whereClausesAnd.push(`"role" = ANY(:roles)`);
    params["roles"] = roles;
  }

  const users: Pick<
    AppUser,
    "id" | "email" | "nom" | "prenom" | "role"
  >[] = await usersRepository.findManyWithQuery({
    select: ["id", "email", "nom", "prenom", "role"],
    where: whereClausesAnd.join(" AND "),
    params,
  });

  return users;
}
