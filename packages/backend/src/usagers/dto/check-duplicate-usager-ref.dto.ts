import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CheckDuplicateUsagerRefDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public customRef!: string;
}
