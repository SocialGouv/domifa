import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { StructureDto } from "./structure.dto";
import { UserDto } from "../../users/dto";

export class StructureWithUserDto {
  @ValidateNested()
  @Type(() => StructureDto)
  @IsNotEmpty()
  public structure!: StructureDto;

  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  public user!: UserDto;
}
