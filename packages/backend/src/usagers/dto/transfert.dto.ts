import { IsNotEmpty } from "class-validator";

export class TransfertDto {
  @IsNotEmpty()
  public actif: boolean;

  @IsNotEmpty()
  public nom: string;

  @IsNotEmpty()
  public adresse: string;

  @IsNotEmpty()
  public adresseComplement: string;
}
