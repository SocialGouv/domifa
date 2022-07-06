import { ChangeData } from "ngx-intl-tel-input";
import { Telephone, COUNTRY_CODES } from "../../../_common/model";

export const getPhoneString = (telephone: Telephone): string => {
  return !telephone
    ? ""
    : telephone.numero !== null && telephone.numero !== ""
    ? `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`
    : "";
};

export const getIndicatif = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

export function getFormPhone(formValue: ChangeData): Telephone {
  return {
    numero: formValue?.number.replace(/\s/g, ""),
    countryCode: formValue?.countryCode.toLowerCase(),
  };
}

export function setFormPhone(telephone: Telephone): ChangeData {
  return {
    // eslint-disable-next-line id-denylist
    number: telephone.numero.replace(/\s/g, ""),
    dialCode: getIndicatif(telephone.countryCode),
  };
}
