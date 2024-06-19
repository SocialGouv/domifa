import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Trim } from "../../_common/decorators";

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  public searchString!: string;
}
