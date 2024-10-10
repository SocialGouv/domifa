import {
  IsHexadecimal,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class StructureConfirmationDto {
  @MinLength(12)
  @IsString()
  @IsHexadecimal()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsUUID()
  public readonly uuid!: string;
}
