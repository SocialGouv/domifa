import { UsagerLight, UsagerPG, UsagerTable } from "../../entities";
import { pgRepository, PgRepositoryFindOrder } from "../_postgres";

const baseRepository = pgRepository.get<UsagerTable, UsagerLight>(UsagerTable, {
  defaultSelect: [
    "uuid",
    "ref",
    "customRef",
    "structureId",
    "nom",
    "prenom",
    "surnom",
    "sexe",
    "dateNaissance",
    "email",
    "decision",
    "typeDom",
    "docs",
    "entretien",
    "etapeDemande",
    "rdv",
    "lastInteraction",
    "options",
    "historique",
    "ayantsDroits",
    "villeNaissance",
    "phone",
    "langue",
    "preference",
  ],
});

export const usagerLightRepository = {
  ...baseRepository,
  findDoublon,
  findNextRendezVous,
};

function findDoublon({
  nom,
  prenom,
  ref,
  structureId,
}: {
  nom: string;
  prenom: string;
  ref: number;
  structureId: number;
}) {
  return baseRepository.findOneWithQuery({
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

function findNextRendezVous({
  userId,
  dateRefNow = new Date(),
}: {
  userId: number;
  dateRefNow?: Date;
}): Promise<Pick<UsagerPG, "nom" | "prenom" | "uuid" | "ref" | "rdv">[]> {
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
