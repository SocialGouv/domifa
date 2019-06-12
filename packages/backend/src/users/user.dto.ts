import { IsDate, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  public readonly firstName: string;

  @IsNotEmpty()
  public readonly lastName: string;

  @IsEmail()
  public readonly mail: string;

  @IsNotEmpty()
  public readonly password: string;

  @IsNotEmpty()
  public readonly structureID: number;

  @IsOptional()
  public readonly structure: {};

  @IsOptional()
  public readonly phone: string;
}
