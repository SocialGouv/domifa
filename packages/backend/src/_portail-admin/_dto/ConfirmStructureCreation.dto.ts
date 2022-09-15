import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class ConfirmStructureCreation {
  @MinLength(12)
  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsNumber()
  public readonly structureId!: number;
}
