import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional
} from "class-validator";
import { AyantDroit } from "../interfaces/ayant-droit";

export class UsagersDto {
  @IsIn(["homme", "femme"])
  public sexe: string;

  @IsNumber()
  @IsOptional()
  public id: number;

  @IsNotEmpty()
  public nom: string;

  @IsNotEmpty()
  public prenom: string;

  @IsOptional()
  public surnom: string;

  @IsNotEmpty()
  public dateNaissance: Date;

  @IsNotEmpty()
  public villeNaissance: string;

  @IsOptional()
  public email: string;

  @IsOptional()
  public phone: string;

  @IsOptional()
  @IsNumber()
  public etapeDemande: number;

  @IsOptional()
  @IsNumber()
  public structureId: number;

  @IsOptional()
  public preference: {
    email: boolean;
    phone: boolean;
  };

  @IsOptional()
  public ayantsDroits: AyantDroit[];
}
