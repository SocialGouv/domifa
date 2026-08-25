import { IsBoolean, IsNotEmpty } from "class-validator";

export class StructureEditPortailUsagerDto {
  @IsNotEmpty()
  @IsBoolean()
  usagerLoginUpdateLastInteraction: boolean;

  @IsNotEmpty()
  @IsBoolean()
  enabledByStructure: boolean;
}
