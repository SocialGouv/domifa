import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";
import { AyantDroit } from "../interfaces/ayant-droit";

export class UsagersDto {
  @IsIn(["homme", "femme"])
  public sexe!: string;

  @IsNumber()
  @IsOptional()
  public id!: number;

  @IsOptional()
  public customId!: string;

  @IsNotEmpty()
  public nom!: string;

  @IsNotEmpty()
  public prenom!: string;

  @IsOptional()
  public surnom!: string;

  @IsNotEmpty()
  public dateNaissance!: Date;

  @IsNotEmpty()
  public villeNaissance!: string;

  @IsOptional()
  public email!: string;

  @IsOptional()
  public phone!: string;

  @IsOptional()
  @IsNumber()
  public etapeDemande!: number;

  @IsOptional()
  @IsNumber()
  public structureId!: number;

  @IsOptional()
  @IsIn(["RENOUVELLEMENT", "PREMIERE"])
  public typeDom!: string;

  @IsOptional()
  public preference!: {
    email: boolean;
    phone: boolean;
  };

  @IsOptional()
  public ayantsDroits!: AyantDroit[];
}
