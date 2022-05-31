import { Telephone } from "../../model";

export type UsagerPreferenceContact = {
  phone: boolean;
  phoneNumber?: string;
  telephone: Telephone;
};
