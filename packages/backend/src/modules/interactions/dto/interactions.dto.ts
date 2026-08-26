import {
  IsBoolean,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";
import { ALL_INTERACTION_TYPES } from "../../../_common/model";
import {
  InteractionType,
  INTERACTIONS_IN,
  INTERACTIONS_OUT,
} from "@domifa/common";

export class InteractionDto {
  @IsIn(ALL_INTERACTION_TYPES)
  @IsNotEmpty()
  public type!: InteractionType;

  @ValidateIfElseNull((o) => INTERACTIONS_IN.includes(o.type))
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @StripTagsTransform({ multiline: true })
  public content?: string;

  @ValidateIfElseNull((o) => INTERACTIONS_OUT.includes(o.type))
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  public procurationIndex?: number;

  @ValidateIfElseNull((o) => INTERACTIONS_IN.includes(o.type))
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
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
