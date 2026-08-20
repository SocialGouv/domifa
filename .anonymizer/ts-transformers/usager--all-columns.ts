import { main } from "./common/lib"
import {
  firstName,
  fullName,
  lastName,
  randomInt,
  truncateJsonDateToMonth,
  truncateTimestampColumnToMonth,
} from "./common/data-helpers"
import { fakeDecision } from "./common/entities"
import { fakerFR as faker } from "@faker-js/faker"

function anonymizeHistorique(raw: string) {
  const historique = JSON.parse(raw)

  return JSON.stringify(
    historique.map((decision: any) => ({
      ...fakeDecision(decision),
      dateDecision: truncateJsonDateToMonth(decision.dateDecision),
      dateDebut: truncateJsonDateToMonth(decision.dateDebut),
      dateFin: truncateJsonDateToMonth(decision.dateFin),
    }))
  )
}

function anonymizeAyantsDroits(raw: string) {
  const ayantsDroits = JSON.parse(raw)

  return JSON.stringify(
    ayantsDroits.map((ayantDroit: any) => ({
      ...ayantDroit,
      prenom: firstName(),
      nom: lastName(),
      dateNaissance: truncateJsonDateToMonth(ayantDroit.dateNaissance),
    }))
  )
}

function anonymizeImport(raw: string) {
  const usagerImport = JSON.parse(raw)

  return JSON.stringify({
    ...usagerImport,
    userId: randomInt(),
    userName: fullName(),
    date: truncateJsonDateToMonth(usagerImport.date),
  })
}

function anonymizeRdv(raw: string) {
  const rdv = JSON.parse(raw)

  return JSON.stringify({
    ...rdv,
    userId: randomInt(),
    userName: fullName(),
    dateRdv: truncateJsonDateToMonth(rdv.dateRdv),
  })
}

function anonymizeOptions(raw: string) {
  const options = JSON.parse(raw)

  const procurations = (options?.procurations ?? []).map(
    (procuration: any) => ({
      nom: lastName(),
      prenom: firstName(),
      dateNaissance: truncateJsonDateToMonth(procuration.dateNaissance),
      dateFin: truncateJsonDateToMonth(procuration.dateFin),
      dateDebut: truncateJsonDateToMonth(procuration.dateDebut),
    })
  )

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
      }

  return JSON.stringify({ ...options, transfert, procurations })
}

function anonymize(values: Record<string, any>) {
  if (values.historique) {
    values.historique = anonymizeHistorique(values.historique)
  }

  if (values.ayantsDroits) {
    values.ayantsDroits = anonymizeAyantsDroits(values.ayantsDroits)
  }

  if (values.import) {
    values.import = anonymizeImport(values.import)
  }

  if (values.rdv) {
    values.rdv = anonymizeRdv(values.rdv)
  }

  if (values.options) {
    values.options = anonymizeOptions(values.options)
  }

  if (values.dateNaissance) {
    values.dateNaissance = truncateTimestampColumnToMonth(values.dateNaissance)
  }
}

main(anonymize)
