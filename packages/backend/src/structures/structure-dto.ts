import { IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class StructureDto {
  @IsNumber()
  @IsOptional()
  public id!: number;

  @IsNotEmpty()
  @IsIn(["asso", "ccas", "hopital"])
  public structureType!: string;

  @IsNotEmpty()
  public adresse!: string;

  @IsNotEmpty()
  public nom!: string;

  @IsOptional()
  public adresseCourrier!: string;

  @IsOptional()
  public complementAdresse!: string;

  @IsNumber()
  @IsOptional()
  public capacite!: number;

  @IsNotEmpty()
  public codePostal!: string;

  @IsNotEmpty()
  public ville!: string;

  @IsOptional()
  public agrement!: string;

  @IsOptional()
  public departement!: string;

  @IsNotEmpty()
  public email!: string;

  @IsNotEmpty()
  public phone!: string;

  @IsNotEmpty()
  public responsable!: {
    fonction: string;
    nom: string;
    prenom: string;
  };
}
