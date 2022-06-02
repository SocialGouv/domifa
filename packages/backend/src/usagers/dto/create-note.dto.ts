import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateNoteDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  @IsString()
  public message!: string;
}
