import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

import { StripTagsTransform } from "../../_common/decorators";
import { UsagerOptionsTransfert } from "@domifa/common";

export class TransfertDto implements UsagerOptionsTransfert {
  @IsBoolean()
  @Transform(() => {
    return true;
  })
  public actif!: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @StripTagsTransform()
  public nom!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(400)
  @MinLength(10)
  @StripTagsTransform()
  public adresse!: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateFin!: Date;
}
