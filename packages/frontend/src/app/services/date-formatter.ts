import { Injectable } from "@angular/core";
import {
  NgbDateParserFormatter,
  NgbDateStruct
} from "@ng-bootstrap/ng-bootstrap";
import { isNumber, padNumber, toInteger } from "../shared/bootstrap-util";

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  public parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split("/");
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { day: toInteger(dateParts[0]), month: null, year: null };
      } else if (
        dateParts.length === 2 &&
        isNumber(dateParts[0]) &&
        isNumber(dateParts[1])
      ) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: null
        };
      } else if (
        dateParts.length === 3 &&
        isNumber(dateParts[0]) &&
        isNumber(dateParts[1]) &&
        isNumber(dateParts[2])
      ) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: toInteger(dateParts[2])
        };
      }
    }
    return null;
  }

  public format(date: NgbDateStruct): string {
    if (date === null) {
      return "";
    }
    return `${isNumber(date.day) ? padNumber(date.day) : ""}/${
      isNumber(date.month) ? padNumber(date.month) : ""
    }/${date.year}`;
  }

  public formatEn(date: NgbDateStruct): string {
    return `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${
      isNumber(date.day) ? padNumber(date.day) : ""
    }`;
  }
}
