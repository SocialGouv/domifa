import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from "class-validator";

export class InteractionDto {
  @IsIn([
    "courrierIn",
    "courrierOut",
    "recommandeIn",
    "recommandeOut",
    "colisIn",
    "colisOut",
    "appel",
    "visite",
  ])
  @IsNotEmpty()
  public type!: string;

  @IsOptional()
  public content!: string;

  @IsOptional()
  @IsBoolean()
  public transfert!: boolean;

  @IsOptional()
  @IsBoolean()
  public procuration!: boolean;

  @IsOptional()
  @IsNumber()
  public nbCourrier!: number;
}
