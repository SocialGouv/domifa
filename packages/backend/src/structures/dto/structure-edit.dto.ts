import { IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class StructureEditDto {
  @IsNotEmpty()
  @IsIn(["asso", "ccas", "cias", "hopital"])
  public structureType!: string;

  @IsOptional()
  public adresse!: string;

  @IsOptional()
  public nom!: string;

  @IsOptional()
  public adresseCourrier!: string;

  @IsOptional()
  public complementAdresse!: string;

  @IsNumber()
  @IsOptional()
  public capacite!: number;

  @IsOptional()
  public codePostal!: string;

  @IsOptional()
  public ville!: string;

  @IsOptional()
  public agrement!: string;

  @IsOptional()
  public departement!: string;

  @IsOptional()
  public email!: string;

  @IsOptional()
  public phone!: string;

  @IsOptional()
  public rattachement!: string;

  @IsOptional()
  public responsable!: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  @IsNotEmpty()
  public options!: {
    colis: boolean;
    customId: boolean;
    numeroBoite: boolean;
  };
}
