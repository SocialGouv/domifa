import { ChangeData } from "ngx-intl-tel-input";
import { Telephone, COUNTRY_CODES } from "../../../_common/model";

export const getPhoneString = (telephone: Telephone): string => {
  return !telephone
    ? ""
    : `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`;
};

export const getIndicatif = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

// HOTFIX en attendant qu'on intégre les countryCodes dans les usagers
export const telephoneFixCountryCode = (
  countryCode: string,
  phone: string
): string => {
  if (COUNTRY_CODES[countryCode] === undefined) {
    return "+33";
  }

  if (countryCode === "fr" && phone[0] === "0") {
    const newPhone = phone.substring(1, phone.length);
    return `${getIndicatif(countryCode)}${newPhone}`;
  }

  return `${getIndicatif(countryCode)}${phone}`;
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
