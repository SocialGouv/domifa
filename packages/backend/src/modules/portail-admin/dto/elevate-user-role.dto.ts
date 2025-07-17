import { IsNotEmpty, IsUUID } from "class-validator";

export class ElevateUserRoleDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly uuid!: string;
}
