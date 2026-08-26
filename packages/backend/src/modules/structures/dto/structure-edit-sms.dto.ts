import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import {
  StripTagsTransform,
  TrimOrNullTransform,
} from "../../../_common/decorators";
import { StructureMessageSmsSchedule } from "@domifa/common";
import { ScheduleDto } from "./schedule.dto";
import { Type } from "class-transformer";

const isSmsSenderFieldValidated = (
  o: StructureEditSmsDto,
  value: unknown
): boolean =>
  o.enabledByStructure === true || (value !== null && value !== undefined);

export class StructureEditSmsDto {
  @IsEmpty()
  public enabledByDomifa: boolean;

  @IsNotEmpty()
  @IsBoolean()
  public enabledByStructure: boolean;

  @ValidateIf(isSmsSenderFieldValidated)
  @MaxLength(11)
  @MinLength(1)
  @IsNotEmpty()
  @IsString()
  @Matches("^[a-zA-Z ]*$")
  @TrimOrNullTransform()
  public senderName: string;

  @ValidateIf(isSmsSenderFieldValidated)
  @MaxLength(30)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  @StripTagsTransform()
  public senderDetails: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  public schedule: StructureMessageSmsSchedule;
}
