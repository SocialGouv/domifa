import { Usager, UsagerLight } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository, PgRepositoryFindOrder } from "../_postgres";
import { USAGER_LIGHT_ATTRIBUTES } from "./constants";

const baseRepository = pgRepository.get<UsagerTable, UsagerLight>(UsagerTable, {
  defaultSelect: USAGER_LIGHT_ATTRIBUTES,
});

export const usagerLightRepository = {
  ...baseRepository,
  findDoublons,
  findNextRendezVous,
  findLastFiveCustomRef,
};

function findDoublons({
  nom,
  prenom,
  ref,
  structureId,
}: {
  nom: string;
  prenom: string;
  ref: number;
  structureId: number;
}): Promise<UsagerLight[]> {
  return baseRepository.findManyWithQuery({
    select: USAGER_LIGHT_ATTRIBUTES,
    where: `"structureId" = :structureId
      and "ref" <> :usagerRef
      and LOWER("nom") = :nom
      and LOWER("prenom") = :prenom`,
    params: {
      usagerRef: ref,
      structureId,
      nom: nom.toLowerCase(),
      prenom: prenom.toLowerCase(),
    },
  });
}

function findLastFiveCustomRef({
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
  return baseRepository.findManyWithQuery({
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

function findNextRendezVous({
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
