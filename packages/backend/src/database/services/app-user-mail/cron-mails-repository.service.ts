import { AppUser } from "../../../_common/model";
import { AppUserTable } from "../../entities";
import {
  appTypeormManager,
  postgresQueryBuilder,
} from "../../services/_postgres";

export type CronMailType = "guide" | "import";

export const cronMailsRepository = {
  updateMailFlag,
  findNextUserToSendCronMail,
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

async function findNextUserToSendCronMail({
  maxCreationDate,
  structuresIds,
  mailType,
}: {
  maxCreationDate: Date;
  structuresIds: number[] | undefined; // undefined if not used
  mailType: CronMailType;
}) {
  const maxCreationDateString = postgresQueryBuilder.formatPostgresDate(
    maxCreationDate
  );

  const whereClausesAnd = [
    `"createdAt" <= $1::timestamp at time zone 'Europe/Paris'`,
    `(mails->>$2)::boolean = false`,
  ];
  const params: any[] = [maxCreationDateString, mailType];

  if (structuresIds && structuresIds.length) {
    whereClausesAnd.push(`"structureId" = ANY($3)`);
    params.push(structuresIds);
  }

  const query = `
          SELECT id, email, nom, prenom
          FROM app_user
          WHERE ${whereClausesAnd.join(" AND ")} FETCH FIRST ROW ONLY
      ;`;

  const users: Pick<
    AppUser,
    "id" | "email" | "nom" | "prenom"
  >[] = await appTypeormManager
    .getRepository(AppUserTable)
    .query(query, params);

  return users.length ? users[0] : undefined;
}
