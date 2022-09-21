import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import { StructureAdresseCourrierDto, StructureResponsableDto } from ".";
import { TimeZone } from "../../util/territoires";
import { TrimOrNullTransform } from "../../_common/decorators";

import {
  StructureType,
  STRUCTURE_TYPE_MAP,
  Telephone,
} from "../../_common/model";
import { TelephoneDto } from "../../_common/dto";

export class StructureDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: STRUCTURE_TYPE_MAP,
  })
  @IsNotEmpty()
  @IsIn(STRUCTURE_TYPE_MAP)
  public structureType!: StructureType;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public adresse!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @TrimOrNullTransform()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @TrimOrNullTransform()
  public complementAdresse!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Min(0)
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
  @TrimOrNullTransform()
  public ville!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @TrimOrNullTransform()
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
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public email!: string;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TelephoneDto)
  public telephone: Telephone;

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
  @ValidateNested()
  @Type(() => StructureAdresseCourrierDto)
  @IsNotEmpty()
  public adresseCourrier!: StructureAdresseCourrierDto;

  @ApiProperty({
    required: true,
    type: Object,
  })
  @IsOptional()
  public options: {
    numeroBoite: boolean;
    usagerLoginUpdateLastInteraction: boolean;
  };

  @IsOptional()
  public timeZone: TimeZone;
}
