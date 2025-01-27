import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { isAlphanumeric, isString, isUppercase, length } from "class-validator";

@Injectable()
export class ParseHardResetTokenPipe implements PipeTransform {
  transform(value: any) {
    if (
      isString(value) &&
      length(value, 7, 7) &&
      isAlphanumeric(value) &&
      isUppercase(value)
    ) {
      return value.replace(/\W/g, "");
    }
    throw new BadRequestException("TOKEN_INVALID");
  }
}
