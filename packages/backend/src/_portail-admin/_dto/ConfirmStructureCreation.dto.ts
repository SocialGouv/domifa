import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class ConfirmStructureCreation {
  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  @Matches("^s*([0-9a-zA-Z]*)s*$")
  public readonly token!: string;

  @IsNotEmpty()
  @IsNumber()
  public readonly structureId!: number;
}
