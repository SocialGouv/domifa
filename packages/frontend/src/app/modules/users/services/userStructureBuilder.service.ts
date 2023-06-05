import { UserStructure } from "../../../../_common/model";
import { StructureCommonWeb } from "../../structures/types/StructureCommonWeb.class";

export const userStructureBuilder = {
  buildUserStructure,
};

function buildUserStructure(item?: Partial<UserStructure>): UserStructure {
  const user: Partial<UserStructure> = {
    email: (item && item.email) || "",
    fonction: (item && item.fonction) || null,
    id: (item && item.id) || null,
    nom: (item && item.nom) || null,
    password: "",
    prenom: (item && item.prenom) || null,
    role: (item && item.role) || null,
    structureId: (item && item.structureId) || null,
    verified: (item && item.verified) || false,
    domifaVersion: (item && item.domifaVersion) || "1",
    structure:
      item && item.structure
        ? new StructureCommonWeb(item.structure)
        : new StructureCommonWeb({}),
    lastLogin: item && item.lastLogin ? new Date(item.lastLogin) : null,
    acceptTerms: item && item.acceptTerms ? new Date(item.acceptTerms) : null,
    passwordLastUpdate:
      item && item.passwordLastUpdate
        ? new Date(item.passwordLastUpdate)
        : undefined,
  };
  return user as UserStructure;
}
