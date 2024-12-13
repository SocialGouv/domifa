// attestation = dates de la domiciliation active si disponible
// attestation_future = dates supposés de la domiciliation: d
// - Date de début = date du jour
// - Date de fin = demain + 1 an
export enum CerfaDocType {
  attestation = "attestation",
  demande = "demande",
  attestation_future = "attestation_future",
}
