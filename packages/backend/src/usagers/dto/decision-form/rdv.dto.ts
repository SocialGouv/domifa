import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";

export class RdvDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  public userId!: number;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  public isNow!: boolean;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @ValidateIf((o) => o.isNow === false)
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : new Date();
  })
  public dateRdv!: Date;
}
