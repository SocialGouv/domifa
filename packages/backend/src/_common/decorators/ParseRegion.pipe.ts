import { FranceRegion } from "./../../util/territoires/types/FranceRegion.type";
import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { isAlphanumeric, isString } from "class-validator";
import { FRANCE_REGION_CODES } from "../../util/territoires";

@Injectable()
export class ParseRegionPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return null;
    }
    if (isString(value) && value.length === 2 && isAlphanumeric(value)) {
      if (FRANCE_REGION_CODES.indexOf(value as FranceRegion) !== -1) {
        return value;
      }
    }
    throw new BadRequestException("REGION_NOT_FOUND");
  }
}
