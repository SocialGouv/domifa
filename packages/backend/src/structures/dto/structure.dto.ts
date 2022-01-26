import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { StructureAdresseCourrierDto, StructureResponsableDto } from ".";
import { StructureType } from "../../_common/model";

export class StructureDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: ["asso", "ccas", "cias"],
  })
  @IsNotEmpty()
  @IsIn(["asso", "ccas", "cias"])
  public structureType!: StructureType;

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
    required: false,
  })
  @IsOptional()
  public region!: string;

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
    type: Object,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StructureResponsableDto)
  @IsNotEmpty()
  public responsable!: StructureResponsableDto;

  @ApiProperty({
    required: false,
    type: Object,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StructureAdresseCourrierDto)
  @IsNotEmpty()
  public adresseCourrier!: StructureAdresseCourrierDto;
}
