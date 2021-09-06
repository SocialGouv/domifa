import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from "class-validator";

export class StructureEditSmsDto {
  @IsEmpty()
  enabledByDomifa: boolean;

  @IsNotEmpty()
  @IsBoolean()
  enabledByStructure: boolean;

  @MaxLength(11, {
    message: "SENDER_TOO_LONG",
  })
  @IsOptional()
  senderName: string;

  @MaxLength(30, {
    message: "SENDER_TOO_LONG",
  })
  @IsOptional()
  senderDetails: string;
}
