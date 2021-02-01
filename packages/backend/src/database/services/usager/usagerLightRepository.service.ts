import { UsagerLight, UsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";

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
  ],
});

export const usagerLightRepository = {
  ...baseRepository,
  findDoublon,
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
