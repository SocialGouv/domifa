import { Saturation } from "./Saturation.type";
export interface ServiceSaturation {
  precision: string;
  status: Saturation;
}

export interface SoliguideService {
  category: string;
  description: string;
  saturated: ServiceSaturation;
}
export interface SoliguidePlace {
  position: {
    codePostal: string;
    departement: string;
    location: {
      coordinates: number[];
      type: "Point";
    };
    pays: string;
    region: string;
    ville: string;
    adresse: string;
    complementAdresse: string | null;
  };
  name: string;
  lieu_id: number;
  services_all: SoliguideService[];
  entity: {
    mail: string | null;
    phones: [
      {
        label: string | null;
        phoneNumber: string | null;
      }
    ];
  };
}
