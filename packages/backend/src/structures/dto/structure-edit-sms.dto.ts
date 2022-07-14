import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsString,
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
  @MaxLength(11, {
    message: "SENDER_TOO_LONG",
  })
  @MinLength(1, {
    message: "SENDER_TOO_SHORT",
  })
  @IsNotEmpty()
  @IsString()
  @TrimOrNullTransform()
  public senderName: string;

  @ValidateIf((o) => o.enabledByStructure === true)
  @MaxLength(30, {
    message: "SENDER_DETAILS_TOO_LONG",
  })
  @MinLength(1, {
    message: "SENDER_DETAILS_TOO_SHORT",
  })
  @IsNotEmpty()
  public senderDetails: string;
}
