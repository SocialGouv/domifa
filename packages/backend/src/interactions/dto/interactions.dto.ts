import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsBoolean,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import { InteractionType } from "../../_common/model";

export class InteractionDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: [
      "courrierIn",
      "courrierOut",
      "recommandeIn",
      "recommandeOut",
      "colisIn",
      "colisOut",
      "appel",
      "visite",
      "npai",
    ],
  })
  @IsIn([
    "courrierIn",
    "courrierOut",
    "recommandeIn",
    "recommandeOut",
    "colisIn",
    "colisOut",
    "appel",
    "visite",
    "npai",
  ])
  @IsNotEmpty()
  public type!: InteractionType;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public content?: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  public procurationIndex?: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  public nbCourrier!: number;

  @IsEmpty()
  public structureId: number;

  @IsEmpty()
  public usagerRef: number;

  @IsEmpty()
  public userId: number;

  @IsEmpty()
  public userName: string;

  @IsEmpty()
  public dateInteraction: Date;
}
