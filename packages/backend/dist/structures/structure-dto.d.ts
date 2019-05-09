export declare class StructureDto {
    id: number;
    structureType: number;
    adresse: string;
    adressePostale: string;
    complementAdresse: string;
    codePostal: string;
    ville: string;
    agrement: string;
    departement: string;
    email: string;
    phone: string;
    responsable: {
        "fonction": string;
        "nom": string;
        "prenom": string;
    };
}
