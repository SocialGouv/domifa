import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class SuiviSmsDto {
  @IsNotEmpty()
  // tslint:disable-next-line: variable-name
  public id_accuse!: string;

  @IsNotEmpty()
  public numero!: string;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  public statut!: number;

  @IsNotEmpty()
  public timestamp!: string;
}
