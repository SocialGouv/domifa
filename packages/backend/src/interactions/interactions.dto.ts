import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";
import { InteractionType } from "../_common/model/interaction";

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
  public content?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public procuration?: boolean;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
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
