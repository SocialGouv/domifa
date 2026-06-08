import { UserDeleteMotif, USER_DELETE_MOTIF_VALUES } from "@domifa/common";
import { IsIn, IsNotEmpty } from "class-validator";

export class DeleteUserDto {
  @IsIn(USER_DELETE_MOTIF_VALUES)
  @IsNotEmpty()
  public readonly motif!: UserDeleteMotif;
}
