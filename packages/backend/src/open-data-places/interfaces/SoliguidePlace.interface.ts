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
