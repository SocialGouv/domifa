import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class SuiviSmsDto {
  @IsNotEmpty()
  // tslint:disable-next-line: variable-name
  public id_accuse!: string;

  @IsNotEmpty()
  // tslint:disable-next-line: variable-name
  public id_message: string; // 	Identifiant commun en cas d'envoi d'un message groupé.

  @IsNotEmpty()
  public numero!: string;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public statut!: number;

  @IsNotEmpty()
  public timestamp!: string;

  @IsDate()
  date_envoi: Date; // Date d'envoi du message (timestamp).
  @IsDate()
  date_update: Date; // Date de dernière mise à jour du statut (timestamp).

  @IsNumber()
  @Min(0)
  @Max(9999)
  @IsNotEmpty()
  statut_code: number; // Statut détaillé de 0 à 9999 (détails à demander à votre gestionnaire de compte).

  @IsOptional()
  nom: string; // Le nom ou l'identifiant personnel de votre message
}
