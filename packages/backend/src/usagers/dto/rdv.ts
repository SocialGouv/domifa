import { IsDate,  IsNotEmpty, IsDateString,  } from 'class-validator';

export class RdvDto {
  @IsNotEmpty()
  public userId: string;

  @IsNotEmpty()
  @IsDateString()
  public dateRdv: Date;
}
