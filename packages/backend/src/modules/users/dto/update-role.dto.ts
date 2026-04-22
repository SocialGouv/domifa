import { ALL_USER_STRUCTURE_ROLES, UserStructureRole } from "@domifa/common";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateIf,
} from "class-validator";

export class UpdateRoleDto {
  @IsIn(ALL_USER_STRUCTURE_ROLES)
  @IsNotEmpty()
  public readonly role!: UserStructureRole;

  @Transform(({ value }) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null" ||
      value === "undefined"
    ) {
      return null;
    }
    return Number(value);
  })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @IsOptional()
  newReferrerId?: number | null;
}
