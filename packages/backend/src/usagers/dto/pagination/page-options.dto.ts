import { Order } from "@domifa/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsNotEmpty()
  readonly order: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 500,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsNotEmpty()
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
