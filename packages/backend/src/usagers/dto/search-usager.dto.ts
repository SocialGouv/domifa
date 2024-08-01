import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { LowerCaseTransform, Trim } from "../../_common/decorators";

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MinLength(3)
  @LowerCaseTransform()
  public searchString!: string;
}
