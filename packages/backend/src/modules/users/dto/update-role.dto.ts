import { UserStructureRole } from "@domifa/common";
import { IsIn, IsNotEmpty } from "class-validator";
import { USER_STRUCTURE_ROLE_ALL } from "../../../_common/model";

export class UpdateRoleDto {
  @IsIn(USER_STRUCTURE_ROLE_ALL)
  @IsNotEmpty()
  public readonly role!: UserStructureRole;
}
