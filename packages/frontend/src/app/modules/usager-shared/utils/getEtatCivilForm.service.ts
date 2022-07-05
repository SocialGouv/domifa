import { Telephone } from "./../../../../_common/model/telephone/Telephone.type";
import {
  UsagerAyantDroit,
  UsagerEtatCivilFormData,
  UsagerFormAyantDroit,
} from "../../../../_common/model";

import { getFormPhone, isNumber, padNumber } from "../../../shared";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEtatCivilForm(formValue: any): UsagerEtatCivilFormData {
  const ayantsDroits: UsagerAyantDroit[] = formValue.ayantsDroits.map(
    (ayantDroit: UsagerFormAyantDroit) => {
      return {
        lien: ayantDroit.lien,
        nom: ayantDroit.nom,
        prenom: ayantDroit.prenom,
        dateNaissance: new Date(formatEn(ayantDroit.dateNaissance)),
      };
    }
  );

  const telephone: Telephone =
    formValue.phone === null
      ? {
          countryCode: "fr",
          numero: "",
        }
      : {
          countryCode: formValue.phone.countryCode.toLowerCase(),
          numero: formValue.phone.number.trim(),
        };

  const datas: UsagerEtatCivilFormData = {
    sexe: formValue?.sexe,
    nom: formValue?.nom,
    prenom: formValue?.prenom,
    surnom: formValue?.surnom,
    villeNaissance: formValue?.villeNaissance,
    langue: formValue?.langue,
    customRef: formValue?.customRef,
    email: formValue?.email,
    telephone,
    ayantsDroits,
    dateNaissance: new Date(formatEn(formValue.dateNaissance)),
  };

  if (typeof formValue.preference !== "undefined") {
    if (formValue.preference.phone) {
      datas.preference.telephone = getFormPhone(formValue.preference.phone);
    } else {
      datas.preference.telephone = {
        countryCode: "fr",
        numero: "",
      };
    }
  }

  return datas;
}

function formatEn(date: NgbDateStruct): string {
  return date === null
    ? null
    : `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${
        isNumber(date.day) ? padNumber(date.day) : ""
      }`;
}
