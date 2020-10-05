import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from "class-validator";

export class TransfertDto {
  @IsOptional()
  @IsBoolean()
  public actif!: boolean;

  @IsNotEmpty()
  public nom!: string;

  @IsNotEmpty()
  @MinLength(10)
  public adresse!: string;

  @IsEmpty()
  public dateDebut!: Date;

  @IsNotEmpty()
  public dateFin!: Date;
}
