import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber
} from "class-validator";

export class StructureDto {
  @IsNumber()
  @IsOptional()
  public id: number;

  @IsNotEmpty()
  @IsNumber()
  public structureType: number;

  @IsNotEmpty()
  public adresse: string;

  @IsOptional()
  public adressePostale: string;

  @IsOptional()
  public complementAdresse: string;

  @IsNotEmpty()
  public codePostal: string;

  @IsNotEmpty()
  public ville: string;

  @IsNotEmpty()
  public agrement: string;

  @IsNotEmpty()
  public departement: string;

  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  public phone: string;

  @IsNotEmpty()
  public responsable: {
    fonction: string;
    nom: string;
    prenom: string;
  };
}
