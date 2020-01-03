import { IsEmpty, IsNotEmpty, MinLength } from "class-validator";

export class TransfertDto {
  @IsEmpty()
  public actif: boolean;

  @IsNotEmpty()
  public nom: string;

  @IsNotEmpty()
  @MinLength(10)
  public adresse: string;

  @IsEmpty()
  public dateDebut: Date;
}
