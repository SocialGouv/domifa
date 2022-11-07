import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @Matches("^s*([0-9a-zA-Z]*)s*$")
  public token!: string;
}
