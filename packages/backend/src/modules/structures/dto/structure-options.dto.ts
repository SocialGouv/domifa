import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class StructureOptionsDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  public numeroBoite: boolean;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  public surnom: boolean;
}
