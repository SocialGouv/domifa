import { UserStructureResume } from "@domifa/common";
import { UserStructureAuthenticated } from "../_common/model";

export function getCreatedByUserStructure(
  user: Pick<UserStructureAuthenticated, "id" | "prenom" | "nom">
): UserStructureResume {
  return {
    userId: user.id,
    userName: `${user.prenom} ${user.nom}`,
  };
}
