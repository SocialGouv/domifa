import { IsBoolean, IsNotEmpty } from "class-validator";

export class StructureOptionsDto {
  @IsNotEmpty()
  @IsBoolean()
  public numeroBoite: boolean;

  @IsNotEmpty()
  @IsBoolean()
  public surnom: boolean;

  @IsNotEmpty()
  @IsBoolean()
  public nomStructure: boolean;
}
