import { IsNotEmpty, IsNumber, IsObject, IsOptional } from "class-validator";
import { StructureResponsable } from "../../_common/model";

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
  public responsable!: StructureResponsable;

  @IsNotEmpty()
  @IsObject()
  public options!: {
    numeroBoite: boolean;
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
