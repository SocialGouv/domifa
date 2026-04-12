import { Transform } from "class-transformer";
import { IsOptional, IsUUID } from "class-validator";

export class NewReferrerIdDto {
  @Transform(({ value }) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null" ||
      value === "undefined"
    ) {
      return null;
    }
    return value;
  })
  @IsOptional()
  @IsUUID()
  newReferrerId: string | null;
}
