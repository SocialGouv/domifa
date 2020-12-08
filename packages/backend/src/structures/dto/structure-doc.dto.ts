import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StructureDocDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  custom: boolean;
}
