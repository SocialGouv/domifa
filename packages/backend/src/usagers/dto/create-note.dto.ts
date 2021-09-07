import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateNoteDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 1000,
  })
  @IsNotEmpty()
  public message!: string;
}
