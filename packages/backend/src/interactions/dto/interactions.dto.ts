import { ApiProperty } from "@nestjs/swagger";

import {
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { TrimOrNullTransform } from "../../_common/decorators";
import {
  ALL_INTERACTION_TYPES,
  INTERACTION_IN_CREATE_SMS,
  INTERACTION_OUT_REMOVE_SMS,
} from "../../_common/model";
import { InteractionType } from "@domifa/common";

export class InteractionDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: ALL_INTERACTION_TYPES,
  })
  @IsIn(ALL_INTERACTION_TYPES)
  @IsNotEmpty()
  public type!: InteractionType;

  @ApiProperty({
    type: String,
    required: false,
  })
  @ValidateIf((o) => INTERACTION_IN_CREATE_SMS.indexOf(o.type) !== -1)
  @IsOptional()
  @IsString()
  @TrimOrNullTransform()
  public content?: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => INTERACTION_OUT_REMOVE_SMS.indexOf(o.type) !== -1)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  public procurationIndex?: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @ValidateIf((o) => INTERACTION_IN_CREATE_SMS.indexOf(o.type) !== -1)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  public nbCourrier!: number;

  @IsEmpty()
  public structureId?: number;

  @IsEmpty()
  public usagerRef?: number;

  @IsEmpty()
  public userId?: number;

  @IsEmpty()
  public userName?: string;

  @IsEmpty()
  public dateInteraction?: Date;
}
