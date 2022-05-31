import { Telephone } from "../../model";

export type UsagerPreferenceContact = {
  phone: boolean;
  // Numéro pour l'envoi des SMS
  phoneNumber?: string;
  telephone?: Telephone;
};
