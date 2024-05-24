import { main } from "./common/lib"
import {
  truncateDateToMonthFromString,
  lastName,
  firstName,
} from "./common/data-helpers"
import { faker } from "@faker-js/faker";


function anonymize(values: Record<string, any>) {
  const options = JSON.parse(values.options)

  const procurations = (options?.procurations ?? []).map((procuration: any) => ({
    nom: lastName(),
    prenom: firstName(),
    dateNaissance: truncateDateToMonthFromString(procuration.dateNaissance),
    dateFin: truncateDateToMonthFromString(procuration.dateFin),
    dateDebut: truncateDateToMonthFromString(procuration.dateDebut),
  }));

  const transfert = options.transfert?.actif
    ? {
      actif: true,
      nom: lastName(),
      adresse: faker.location.streetAddress(),
      dateDebut: options.transfert.dateDebut,
      dateFin: options.transfert.dateFin,
    }
    : {
      actif: false,
      nom: null,
      adresse: null,
      dateDebut: null,
      dateFin: null,
    };

  const anonymised = {
    ...options,
    transfert,
    procurations,
  };
  values.options = JSON.stringify(anonymised)
}

main(["options"], anonymize)
