import { Telephone } from "../../model";

export type UsagerPreferenceContact = {
  email: boolean;
  phone: boolean;
  // Numéro pour l'envoi des SMS
  phoneNumber?: string;
  telephone?: Telephone;
};
