import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from "class-validator";

export class ConfirmStructureCreation {
  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  public readonly token!: string;

  @IsNotEmpty()
  @IsNumber()
  public readonly structureId!: number;
}
