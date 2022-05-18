import { ALL_INTERACTION_TYPES } from "./../../_common/model/interaction/InteractionType.type";
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class InteractionSearchDto {
  @IsIn(ALL_INTERACTION_TYPES)
  @IsNotEmpty()
  public type!: string;

  @IsOptional()
  public content!: string;

  @IsOptional()
  @IsNumber()
  public nbCourrier!: number;
}
