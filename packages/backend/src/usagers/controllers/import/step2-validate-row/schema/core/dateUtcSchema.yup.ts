import { parseISO, isValid } from "date-fns";
import * as yup from "yup";
import { appLogger } from "../../../../../../util";
import { ValidationRegexp } from "./ValidationRegexp.data";

export const dateUtcSchema = () =>
  yup.date().transform((value, originalValue) => {
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

      let parsedDate: Date;

      try {
        if (typeof originalValue === "string") {
          parsedDate = parseISO(originalValue);
        } else if (originalValue instanceof Date) {
          parsedDate = originalValue;
        } else {
          parsedDate = new Date(originalValue);
        }

        if (!isValid(parsedDate)) {
          appLogger.warn(`Invalid date (date-fns)`, {
            sentry: true,
            context: { originalValue },
          });
          return yup.date.INVALID_DATE;
        }

        return new Date(
          Date.UTC(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate(),
            12,
            0,
            0,
            0
          )
        );
      } catch (error) {
        appLogger.warn(`Error parsing date`, {
          sentry: true,
          context: { originalValue },
        });
        return yup.date.INVALID_DATE;
      }
    }
    return null;
  });
