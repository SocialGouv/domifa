import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
  public type!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public content!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public transfert!: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public procuration!: boolean;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public nbCourrier!: number;
}
