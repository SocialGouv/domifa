import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import { StructureAdresseCourrierDto, StructureResponsableDto } from ".";
import { TimeZone } from "../../util/territoires";
import { StructureType, Telephone } from "../../_common/model";
import { TelephoneDto } from "../../_common/dto";

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
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public adresse!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public nom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value) {
      return value.trim();
    }
    return null;
  })
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
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
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
  @Transform(({ value }: TransformFnParams) => {
    return value.trim();
  })
  public email!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  public phone: string;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => TelephoneDto)
  @IsNotEmpty()
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
  @IsNotEmpty()
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
  };

  @IsEmpty()
  public timeZone: TimeZone;
}
