import { Telephone } from "../_common/model/index";
import countryCode from "./countryCode";

export const telephoneString = (telephone: Telephone): string => {
  if (!telephone) return "";

  return `+${countryCode[telephone.indicatif]}${telephone.numero}`;
};

export const telephoneIndicatif = (indicatif: string): string => {
  if (countryCode[indicatif] === undefined) return "+33";

  return `+${countryCode[indicatif]}`;
};

// HOTFIX en attendant qu'on intégre les indicatifs dans les usagers
export const telephoneFixIndicatif = (
  indicatif: string,
  phone: string
): string => {
  if (countryCode[indicatif] === undefined) return "+33";

  if (indicatif === "fr" && phone[0] === "0") {
    const newPhone = phone.substring(1, phone.length);
    return `${telephoneIndicatif(indicatif)}${newPhone}`;
  }

  return `${telephoneIndicatif(indicatif)}${phone}`;
};
