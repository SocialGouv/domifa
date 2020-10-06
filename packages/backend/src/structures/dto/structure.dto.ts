import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StructureDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: ["asso", "ccas", "cias", "hopital"],
  })
  @IsNotEmpty()
  @IsIn(["asso", "ccas", "cias", "hopital"])
  public structureType!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public adresse!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public complementAdresse!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public capacite!: number;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public codePostal!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public ville!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public agrement!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  public departement!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public phone!: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  public responsable!: {
    fonction: string;
    nom: string;
    prenom: string;
  };

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsObject()
  public adresseCourrier!: {
    actif: boolean;
    adresse: string;
    ville: string;
    codePostal: string;
  };
}
