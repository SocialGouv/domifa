import { Telephone } from "../common";

export type UsagerPreferenceContact = {
  phone: boolean;
  phoneNumber?: string;
  telephone: Telephone;
};
