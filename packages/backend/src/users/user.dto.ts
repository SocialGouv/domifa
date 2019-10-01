import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UserDto {
  @IsNotEmpty()
  public readonly prenom: string;

  @IsNotEmpty()
  public readonly nom: string;

  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty()
  public readonly password: string;

  @IsNotEmpty()
  @IsNumber()
  public readonly structureId: number;

  @IsOptional()
  public readonly structure: {};

  @IsOptional()
  public readonly phone: string;
}
