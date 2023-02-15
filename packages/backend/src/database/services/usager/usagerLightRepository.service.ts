import { Usager, UsagerLight } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository, PgRepositoryFindOrder } from "../_postgres";
import { USAGER_LIGHT_ATTRIBUTES } from "./constants";

const baseRepository = pgRepository.get<UsagerTable, UsagerLight>(UsagerTable, {
  defaultSelect: USAGER_LIGHT_ATTRIBUTES,
});

export const usagerLightRepository = {
  ...baseRepository,
  findNextMeetings,
  findLastFiveCustomRef,
};

async function findLastFiveCustomRef({
  structureId,
  usagerRef,
}: {
  structureId: number;
  usagerRef: number;
}): Promise<
  Pick<
    Usager,
    "ref" | "customRef" | "nom" | "sexe" | "prenom" | "structureId"
  >[]
> {
  return await baseRepository.findManyWithQuery({
    select: ["ref", "customRef", "nom", "sexe", "prenom", "structureId"],
    where: `decision->>'statut' = :statut and "structureId" = :structureId and ref != :usagerRef`,
    params: {
      statut: "VALIDE",
      structureId,
      usagerRef,
    },
    order: {
      "(decision->>'dateDecision')::timestamptz": "DESC",
    } as PgRepositoryFindOrder<any>,
    maxResults: 5,
  });
}

async function findNextMeetings({
  userId,
  dateRefNow = new Date(),
}: {
  userId: number;
  dateRefNow?: Date;
}): Promise<Pick<Usager, "nom" | "prenom" | "uuid" | "ref" | "rdv">[]> {
  return baseRepository.findManyWithQuery({
    where: `rdv->>'userId' = :userId
      and (rdv->>'dateRdv')::timestamptz > :dateRefNow`,
    params: {
      userId,
      dateRefNow,
    },
    order: {
      "(rdv->>'dateRdv')::timestamptz": "DESC",
    } as PgRepositoryFindOrder<any>,
    select: ["nom", "prenom", "uuid", "ref", "rdv"],
  });
}
