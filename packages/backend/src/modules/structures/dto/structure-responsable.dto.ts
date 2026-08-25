import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class StructureResponsableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public readonly fonction: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public readonly nom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public readonly prenom: string;
}
