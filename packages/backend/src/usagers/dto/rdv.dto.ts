import { IsNotEmpty } from "class-validator";

export class RdvDto {
  @IsNotEmpty()
  public userId!: number;

  @IsNotEmpty()
  public dateRdv!: Date;
}
