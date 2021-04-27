import * as moment from "moment";
import * as yup from "yup";
import { appLogger } from "../../../../../../util";
import { ValidationRegexp } from "./ValidationRegexp.data";

const DEFAULT_PARSE_FORMATS = ["DD/MM/YYYY"];
// @see https://github.com/jquense/yup/blob/master/docs/extending.md
export const dateUtcSchema = (
  {
    parseFormats = DEFAULT_PARSE_FORMATS,
    startOfDay = true,
  }: {
    parseFormats?: string[];
    startOfDay?: boolean;
  } = {
    parseFormats: DEFAULT_PARSE_FORMATS,
    startOfDay: true,
  }
) =>
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

      const momentDate = startOfDay
        ? moment.utc(originalValue, parseFormats).startOf("day")
        : moment.utc(originalValue, parseFormats);

      if (!momentDate.isValid) {
        appLogger.warn(`Invalid date (moment)`, {
          sentryBreadcrumb: true,
          extra: {
            originalValue,
          },
        });
        return yup.date.INVALID_DATE;
      }
      return momentDate.toDate();
    }
  });
