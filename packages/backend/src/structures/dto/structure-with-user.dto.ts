import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { StructureDto } from "./structure.dto";

export class StructureWithUserDto {
  @ValidateNested()
  @Type(() => StructureDto)
  @IsNotEmpty()
  public structure: StructureDto;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  public user: UserDto;
}
