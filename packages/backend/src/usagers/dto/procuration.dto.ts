import { IsEmpty, IsNotEmpty, MinLength } from "class-validator";

export class ProcurationDto {
  @IsEmpty()
  public actif: boolean;

  @IsNotEmpty()
  public nom: string;

  @IsNotEmpty()
  public prenom: string;

  @IsNotEmpty()
  public dateFin: Date;

  @IsNotEmpty()
  public dateNaissance: string;
}
