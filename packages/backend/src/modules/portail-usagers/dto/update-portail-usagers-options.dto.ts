import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdatePortailUsagerOptionsDto {
  @IsNotEmpty()
  @IsBoolean()
  public portailUsagerEnabled!: boolean;

  @IsNotEmpty()
  @IsBoolean()
  public generateNewPassword!: boolean;
}
