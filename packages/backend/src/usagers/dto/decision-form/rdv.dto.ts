import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsInt,
  Min,
  ValidateIf,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { StrictIntTransform } from "../../../_common/decorators";

export class RdvDto {
  @IsNotEmpty()
  @StrictIntTransform()
  @IsInt()
  @Min(1)
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
