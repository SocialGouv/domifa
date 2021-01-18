import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";
import { UserDto } from "../../users/dto/user.dto";
import { StructureDto } from "./structure.dto";

export class StructureWithUserDto {
  @ApiProperty({
    type: StructureDto,
    required: true,
  })
  @IsObject()
  structure: StructureDto;
  @ApiProperty({
    type: UserDto,
    required: true,
  })
  @IsObject()
  user: UserDto;
}
