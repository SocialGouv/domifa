import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class SearchDto {

  @IsOptional()
  public statut: string;

  @IsOptional()
  public name: string;

  @IsOptional()
  public echeance: string;

  @IsBoolean()
  @IsOptional()
  public courrier: boolean;

  @IsNumber()
  @IsOptional()
  public id: number;
}
