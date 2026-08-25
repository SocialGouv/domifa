import { IsNotEmpty, IsString, MaxLength } from "class-validator";

import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../../_common/decorators";

export class CheckDuplicateUsagerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(400)
  @StripTagsTransform()
  @LowerCaseTransform()
  public nom: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(400)
  @StripTagsTransform()
  @LowerCaseTransform()
  public prenom!: string;
}
