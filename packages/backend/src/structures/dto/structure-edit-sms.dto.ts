import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { TrimOrNullTransform } from "../../_common/decorators";

export class StructureEditSmsDto {
  @IsEmpty()
  public enabledByDomifa: boolean;

  @IsNotEmpty()
  @IsBoolean()
  public enabledByStructure: boolean;

  @ValidateIf((o) => o.enabledByStructure === true)
  @MaxLength(11)
  @MinLength(1)
  @IsNotEmpty()
  @IsString()
  @Matches("^[a-zA-Z ]*$")
  @TrimOrNullTransform()
  public senderName: string;

  @ValidateIf((o) => o.enabledByStructure === true)
  @MaxLength(30)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  public senderDetails: string;
}
