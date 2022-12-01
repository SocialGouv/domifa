import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { isString } from "class-validator";

@Injectable()
export class ParseStringPipe implements PipeTransform {
  transform(value: any) {
    if (isString(value)) {
      if (value.match(/^[a-zA-ZÀ-ÿ-. \']*$/)) {
        return value;
      }
    }
    throw new BadRequestException("STRING_INVALID");
  }
}
