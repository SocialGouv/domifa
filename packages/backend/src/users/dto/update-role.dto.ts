import { UserStructureRole } from "./../../_common/model/user-structure/UserStructureRole.type";
import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateRoleDto {
  @IsIn(["simple", "admin", "facteur", "responsable"])
  @IsNotEmpty()
  public readonly role!: UserStructureRole;
}
