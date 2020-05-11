import { IsNotEmpty, IsOptional } from "class-validator";

export class ProcurationDto {
  @IsOptional()
  public actif!: boolean;

  @IsNotEmpty()
  public nom!: string;

  @IsNotEmpty()
  public prenom!: string;

  @IsNotEmpty()
  public dateFin!: Date;

  @IsNotEmpty()
  public dateNaissance!: string;
}
