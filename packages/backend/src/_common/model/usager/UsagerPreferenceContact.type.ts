import { Telephone } from "../../model";

export type UsagerPreferenceContact = {
  contactByPhone: boolean;
  // ! Deprecated
  phoneNumber?: string;
  telephone: Telephone;
};
