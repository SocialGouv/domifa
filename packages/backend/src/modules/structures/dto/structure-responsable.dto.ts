import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { StripTagsTransform } from "../../../_common/decorators";

export class StructureResponsableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  public readonly fonction: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  public readonly nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  public readonly prenom: string;
}
