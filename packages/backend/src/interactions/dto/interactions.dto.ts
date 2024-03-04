import { ApiProperty } from "@nestjs/swagger";

import {
  IsBoolean,
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
import {
  StripTagsTransform,
  TrimOrNullTransform,
} from "../../_common/decorators";
import { ALL_INTERACTION_TYPES } from "../../_common/model";
import {
  InteractionType,
  INTERACTIONS_IN,
  INTERACTIONS_OUT,
} from "@domifa/common";

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
  @ValidateIf((o) => INTERACTIONS_IN.indexOf(o.type) !== -1)
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
  public content?: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => INTERACTIONS_OUT.indexOf(o.type) !== -1)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  public procurationIndex?: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @ValidateIf((o) => INTERACTIONS_IN.indexOf(o.type) !== -1)
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

  @IsOptional()
  @IsBoolean()
  public returnToSender?: boolean = false;
}
