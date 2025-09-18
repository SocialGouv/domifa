import { ALL_USER_STRUCTURE_ROLES, UserStructureRole } from "@domifa/common";
import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateRoleDto {
  @IsIn(ALL_USER_STRUCTURE_ROLES)
  @IsNotEmpty()
  public readonly role!: UserStructureRole;
}
