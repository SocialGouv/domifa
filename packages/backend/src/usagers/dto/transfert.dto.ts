import {
  IsEmpty,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsOptional
} from "class-validator";

export class TransfertDto {
  @IsOptional()
  @IsBoolean()
  public actif: boolean = false;

  @IsNotEmpty()
  public nom!: string;

  @IsNotEmpty()
  @MinLength(10)
  public adresse!: string;

  @IsEmpty()
  public dateDebut!: Date;
}
