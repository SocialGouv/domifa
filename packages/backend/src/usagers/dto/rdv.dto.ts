import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RdvDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  public userId!: number;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateRdv!: Date;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  public isNow!: boolean;
}
