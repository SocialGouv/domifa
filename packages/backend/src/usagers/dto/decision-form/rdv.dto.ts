import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class RdvDto {
  @IsNotEmpty()
  @IsNumber()
  public userId!: number;

  @IsNotEmpty()
  @IsBoolean()
  public isNow!: boolean;

  @ValidateIf((o) => o.isNow === false)
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : new Date();
  })
  public dateRdv!: Date;
}
