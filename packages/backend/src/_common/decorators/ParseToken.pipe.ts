import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { isAlphanumeric, isString, minLength } from "class-validator";

@Injectable()
export class ParseTokenPipe implements PipeTransform {
  transform(value: any) {
    if (isString(value) && minLength(value, 5) && isAlphanumeric(value)) {
      return value.replace(/\W/g, "");
    }

    throw new BadRequestException("TOKEN_INVALID");
  }
}
