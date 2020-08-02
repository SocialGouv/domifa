import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from "class-validator";

export class StructureDto {
  @IsNotEmpty()
  @IsIn(["asso", "ccas", "cias", "hopital"])
  public structureType!: string;

  @IsNotEmpty()
  public adresse!: string;

  @IsNotEmpty()
  public nom!: string;

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
  @IsObject()
  public responsable!: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  @IsOptional()
  @IsObject()
  public adresseCourrier!: {
    actif: boolean;
    adresse: string;
    ville: string;
    codePostal: string;
  };
}
