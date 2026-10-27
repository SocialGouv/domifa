import { Order } from "@domifa/common";
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from "class-validator";
import { StrictIntTransform } from "../../../_common/decorators";

export class PageOptionsDto {
  @IsEnum(Order)
  @IsNotEmpty()
  readonly order: Order = Order.ASC;

  @StrictIntTransform()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly page: number = 1;

  @StrictIntTransform()
  @IsInt()
  @Min(1)
  @Max(500)
  @IsNotEmpty()
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
