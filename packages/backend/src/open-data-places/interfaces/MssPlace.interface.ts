export interface MssPlace {
  id: string;
  siret: string;
  type: "Association" | "Cias" | "Commune" | "Ccas";
  name: string;
  zipcode: string;
  city: string;
  address: string;
}
