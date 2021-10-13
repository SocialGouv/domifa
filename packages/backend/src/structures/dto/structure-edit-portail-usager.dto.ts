import { IsBoolean, IsNotEmpty } from "class-validator";

export class StructureEditPortailUsagerDto {
  @IsNotEmpty()
  @IsBoolean()
  enabledByStructure: boolean;
}
