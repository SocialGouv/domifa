import { IsDate, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';
import { AyantDroit } from '../interfaces/ayant-droit';

export class UsagersDto {

  @IsIn(['homme','femme'])
  public sexe: string;

  @IsNotEmpty()
  public nom: string;
  @IsNotEmpty()
  public prenom: string;

  @IsNotEmpty()
  public readonly dateNaissance: Date;

  @IsNotEmpty()
  public villeNaissance: string;

  @IsNotEmpty()
  public codePostalNaissance: string;

  @IsOptional()
  @IsEmail()
  public readonly email: string;

  @IsOptional()
  public readonly phone: string;

  @IsOptional()
  @IsNumber()
  public etapeDemande: number;

  @IsNotEmpty()
  public statutDemande: string;

  @IsNotEmpty()
  public preference: {
    mail: boolean,
    phone: boolean
  };

  @IsOptional()
  public decision: {};

  @IsOptional()
  public ayantsDroits: AyantDroit[];

  @IsNumber()
  @IsOptional()
  public id: number;

}
