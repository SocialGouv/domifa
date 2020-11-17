import { AppUser } from "../../../../_common/model";
import { Structure } from "../../structures/structure.interface";

export const appUserBuilder = {
  buildAppUser,
};

function buildAppUser(item?: Partial<AppUser>): AppUser {
  const user: Partial<AppUser> = {
    email: (item && item.email) || null,
    fonction: (item && item.fonction) || null,
    id: (item && item.id) || null,
    nom: (item && item.nom) || null,
    password: "",
    prenom: (item && item.prenom) || null,

    role: (item && item.role) || null,
    structureId: (item && item.structureId) || null,
    temporaryTokens: (item && item.temporaryTokens) || null,
    verified: (item && item.verified) || false,
    structure:
      item && item.structure
        ? new Structure(item.structure)
        : new Structure({}),
    lastLogin: item && item.lastLogin ? new Date(item.lastLogin) : null,

    passwordLastUpdate:
      item && item.passwordLastUpdate
        ? new Date(item.passwordLastUpdate)
        : undefined,
  };
  return user as AppUser;
}
