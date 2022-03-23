import {
  IsDate,
  IsEmpty,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { UsagerOptionsTransfert } from "../../_common/model";
import { endOfDay } from "date-fns";

export class TransfertDto implements UsagerOptionsTransfert {
  @IsEmpty()
  @Transform(() => {
    return true;
  })
  public actif!: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public adresse!: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? endOfDay(new Date(value)) : null;
  })
  public dateFin!: Date;
}
