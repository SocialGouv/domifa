import * as moment from "moment";
import * as yup from "yup";
import { appLogger } from "../../../../../../util";
import { ValidationRegexp } from "./ValidationRegexp.data";

const DEFAULT_PARSE_FORMATS = "DD/MM/YYYY";
// @see https://github.com/jquense/yup/blob/master/docs/extending.md
export const dateUtcSchema = () =>
  yup.date().transform((value, originalValue) => {
    // Si c'est du texte, Original value sera vide, mais value non
    if (!originalValue && value) {
      originalValue = value;
    }

    if (originalValue) {
      if (
        typeof originalValue === "string" &&
        !RegExp(ValidationRegexp.date).test(originalValue)
      ) {
        return yup.date.INVALID_DATE;
      }

      const momentDate = moment
        .utc(originalValue, DEFAULT_PARSE_FORMATS)
        .startOf("day");

      if (!momentDate.isValid) {
        appLogger.warn(`Invalid date (moment)`, {
          sentry: true,
          context: {
            originalValue,
          },
        });
        return yup.date.INVALID_DATE;
      }
      return momentDate.toDate();
    }
    return null;
  });
