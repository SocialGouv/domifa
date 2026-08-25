import { Order } from "@domifa/common";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class PageOptionsDto {
  @IsEnum(Order)
  @IsNotEmpty()
  readonly order: Order = Order.ASC;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly page: number = 1;

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
