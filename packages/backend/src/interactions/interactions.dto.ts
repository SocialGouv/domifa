import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InteractionDto {

  @IsIn([  "courrierIn", "courrierOut", "recommandeIn", "recommandeOut", "appel", "visite"])
  @IsNotEmpty()
  public type: string;

  @IsOptional()
  public content: string;

  @IsOptional()
  @IsNumber()
  public nbre: number;
}
