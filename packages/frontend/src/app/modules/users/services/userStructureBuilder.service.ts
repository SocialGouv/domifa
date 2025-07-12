import { UserStructure } from "@domifa/common";
import { StructureCommonWeb } from "../../structures/classes/StructureCommonWeb.class";

export const userStructureBuilder = {
  buildUserStructure,
};

function buildUserStructure(item?: Partial<UserStructure>): UserStructure {
  const user: Partial<UserStructure> = {
    uuid: item?.uuid ?? "",
    email: item?.email ?? "",
    fonction: item?.fonction ?? null,
    fonctionDetail: item?.fonctionDetail ?? null,
    id: item?.id ?? null,
    nom: item?.nom ?? null,
    password: "",
    prenom: item?.prenom ?? null,
    role: item?.role ?? null,
    structureId: item?.structureId ?? null,
    verified: item?.verified ?? false,
    domifaVersion: item?.domifaVersion ?? "1",
    structure: item?.structure
      ? new StructureCommonWeb(item.structure)
      : new StructureCommonWeb({}),
    lastLogin: item?.lastLogin ? new Date(item.lastLogin) : null,
    acceptTerms: item?.acceptTerms ? new Date(item.acceptTerms) : null,
    passwordLastUpdate: item?.passwordLastUpdate
      ? new Date(item.passwordLastUpdate)
      : undefined,
  };
  return user as UserStructure;
}
