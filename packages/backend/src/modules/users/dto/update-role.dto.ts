import { UserStructureRole } from "@domifa/common";
import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateRoleDto {
  @IsIn(["simple", "admin", "facteur", "responsable"])
  @IsNotEmpty()
  public readonly role!: UserStructureRole;
}
