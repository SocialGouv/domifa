import { IsBoolean, IsNumber, IsOptional } from "class-validator";
import { TypeInteraction } from '../../interactions/interactions.enum';

export class SearchDto {

  @IsOptional()
  public statut: string;

  @IsOptional()
  public name: string;

  @IsOptional()
  public echeance: string;

  @IsBoolean()
  @IsOptional()
  public interactionStatut: boolean;

  @IsOptional()
  public interactionType: TypeInteraction;

  @IsNumber()
  @IsOptional()
  public id: number;
}
