import { AyantDroit } from '../interfaces/ayant-droit';
export declare class UsagersDto {
    sexe: string;
    nom: string;
    prenom: string;
    readonly dateNaissance: Date;
    villeNaissance: string;
    codePostalNaissance: string;
    readonly email: string;
    readonly phone: string;
    etapeDemande: number;
    statutDemande: string;
    preference: {
        mail: boolean;
        phone: boolean;
    };
    decision: {};
    ayantsDroits: AyantDroit[];
    id: number;
}
