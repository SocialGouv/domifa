import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

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
