import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { isAlphanumeric, isString } from "class-validator";
import { REGIONS_LISTE } from "@domifa/common";

@Injectable()
export class ParseRegionPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return null;
    }
    if (isString(value) && value.length === 2 && isAlphanumeric(value)) {
      if (Object.keys(REGIONS_LISTE).indexOf(value) !== -1) {
        return value;
      }
    }
    throw new BadRequestException("REGION_NOT_FOUND");
  }
}
