import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";

export class CheckDuplicateUsagerDto {
  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  @StripTagsTransform()
  @LowerCaseTransform()
  public nom: string;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(400)
  @StripTagsTransform()
  @LowerCaseTransform()
  public prenom!: string;
}
