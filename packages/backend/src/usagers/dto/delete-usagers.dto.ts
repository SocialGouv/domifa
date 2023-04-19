import { IsArray, IsNumber } from "class-validator";

export class DeleteUsagersDto {
  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  readonly refs: number[];
}
