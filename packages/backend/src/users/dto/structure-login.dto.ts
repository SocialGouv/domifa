import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class StructureLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public readonly password!: string;
}
