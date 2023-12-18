import { StructureOptionsDto } from "./structure-options.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { StructureAdresseCourrierDto, StructureResponsableDto } from ".";
import { TimeZone } from "../../util/territoires";
import { TrimOrNullTransform } from "../../_common/decorators";

import { Telephone } from "../../_common/model";
import { TelephoneDto } from "../../_common/dto";
import { ValidationRegexp } from "../../usagers/controllers/import/step2-validate-row";
import { StructureType, STRUCTURE_TYPE_MAP } from "@domifa/common";

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
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public adresse!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @TrimOrNullTransform()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
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
  @IsString()
  @MaxLength(5)
  @Matches(ValidationRegexp.postcode)
  public codePostal!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @TrimOrNullTransform()
  public ville!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsString()
  @TrimOrNullTransform()
  public agrement!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  public departement!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
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
    type: Object,
    required: true,
  })
  @ValidateNested()
  @Type(() => StructureOptionsDto)
  @IsNotEmpty()
  public options!: StructureOptionsDto;

  @IsEmpty()
  public region!: string;

  @IsOptional()
  @IsTimeZone()
  public timeZone: TimeZone;

  @IsBoolean()
  @Equals(true)
  readCgu: boolean;

  @IsBoolean()
  @Equals(true)
  acceptCgu: boolean;
}
