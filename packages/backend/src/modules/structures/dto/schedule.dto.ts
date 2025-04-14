import { IsBoolean } from "class-validator";

export class ScheduleDto {
  @IsBoolean()
  monday: boolean;

  @IsBoolean()
  tuesday: boolean;

  @IsBoolean()
  wednesday: boolean;

  @IsBoolean()
  thursday: boolean;

  @IsBoolean()
  friday: boolean;
}
