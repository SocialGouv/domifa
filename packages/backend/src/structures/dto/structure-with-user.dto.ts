import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { StructureDto } from "./structure.dto";
import { UserDto } from "../../modules/users/dto";

export class StructureWithUserDto {
  @ValidateNested()
  @Type(() => StructureDto)
  @IsNotEmpty()
  public structure!: StructureDto;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  public user!: UserDto;
}
