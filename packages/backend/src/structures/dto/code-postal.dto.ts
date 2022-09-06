import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CodePostalDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(6)
  public codePostal!: string;
}
