import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EmailDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;
}
