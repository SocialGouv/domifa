import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from "class-validator";

export class StructureEditDto {
  @IsOptional()
  public adresse!: string;

  @IsOptional()
  public nom!: string;

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
  public region!: string;

  @IsOptional()
  public responsable!: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  @IsNotEmpty()
  @IsObject()
  public options!: {
    colis: boolean;
    customId: boolean;
    rattachement: boolean;
    numeroBoite: boolean;
    mailsRdv: boolean;
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
