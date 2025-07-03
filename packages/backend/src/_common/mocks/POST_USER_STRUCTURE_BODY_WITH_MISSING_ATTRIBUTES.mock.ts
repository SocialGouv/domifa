import { UserFonction, UserStructure } from "@domifa/common";
import { POST_USER_STRUCTURE_BODY } from "./POST_USER_STRUCTURE_BODY.mock";

export const POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION: Partial<UserStructure> =
  {
    ...POST_USER_STRUCTURE_BODY,
    fonction: null,
  };

export const POST_USER_STRUCTURE_BODY_WITHOUT_FONCTION_AUTRE_WITHOUT_DETAIL: Partial<UserStructure> =
  {
    ...POST_USER_STRUCTURE_BODY,
    fonction: UserFonction.AUTRE,
    fonctionDetail: null,
  };
