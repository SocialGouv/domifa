import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class StructureEditPortailUsagerDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  usagerLoginUpdateLastInteraction: boolean;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  enabledByStructure: boolean;
}
