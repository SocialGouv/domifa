import { IsDate,  IsDateString, IsNotEmpty,  } from 'class-validator';

export class RdvDto {
  @IsNotEmpty()
  public userId: string;

  @IsNotEmpty()
  @IsDateString()
  public dateRdv: Date;
}
