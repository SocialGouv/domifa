import { UserStructureRole } from "@domifa/common";
import { userStructureRepository } from "..";
import { UserStructure } from "../../../_common/model";
import {
  joinSelectFields,
  postgresQueryBuilder,
} from "../../services/_postgres";

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
      UPDATE user_structure
      SET mails = mails || jsonb_build_object('${mailType}', ${value})
      WHERE id=${userId};
    ;`;

  return userStructureRepository.query(query);
}

async function findUsersToSendCronMail({
  minCreationDate,
  maxCreationDate,
  structuresIds,
  mailType,
}: {
  minCreationDate: Date;
  maxCreationDate: Date;
  structuresIds?: number[];
  mailType: CronMailType;
}): Promise<Pick<UserStructure, "id" | "role" | "email" | "nom" | "prenom">[]> {
  const minCreationDateString =
    postgresQueryBuilder.formatPostgresDate(minCreationDate);

  const maxCreationDateString =
    postgresQueryBuilder.formatPostgresDate(maxCreationDate);

  const whereClausesAnd = [
    `"createdAt" <= (:maxCreationDateString)::timestamp at time zone 'Europe/Paris'`,
    `"createdAt" >= (:minCreationDateString)::timestamp at time zone 'Europe/Paris'`,
    `(mails->>:mailType)::boolean = false`,
  ];
  const params: { [attr: string]: any } = {
    maxCreationDateString,
    minCreationDateString,
    mailType,
  };
  if (structuresIds?.length) {
    whereClausesAnd.push(`"structureId" = ANY(:structuresIds)`);
    params.structuresIds = structuresIds;
  }

  if (mailType === "import") {
    const roles: UserStructureRole[] = ["admin", "simple", "responsable"];
    whereClausesAnd.push(`"role" = ANY(:roles)`);
    params.roles = roles;
  }

  return userStructureRepository
    .createQueryBuilder()
    .where(whereClausesAnd.join(" AND "), params)
    .select(joinSelectFields(["id", "email", "nom", "prenom", "role"]))
    .getRawMany();
}
