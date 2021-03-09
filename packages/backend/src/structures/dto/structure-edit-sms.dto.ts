import { IsBoolean, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class StructureEditSmsDto {
  @IsOptional()
  @IsBoolean()
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
