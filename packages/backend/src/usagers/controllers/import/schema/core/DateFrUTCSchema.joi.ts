import * as Joi from "joi";
import { appLogger } from "../../../../../util";
import { regexp } from "../../../../../_common/import/import.validators";
import moment = require("moment");

export const DateFrUTCSchema = ({
  minDate,
  maxDate,
}: {
  minDate?: Date | Joi.Reference;
  maxDate?: Date | Joi.Reference;
} = {}) =>
  Joi.string()
    .pattern(regexp.date, { name: "date-fr" })
    .custom((dateFr, helpers) => {
      console.log("xxx dateFr:", dateFr);

      const state = helpers.state;

      const momentDate = moment.utc(dateFr, "DD/MM/YYYY").startOf("day");
      if (!momentDate.isValid) {
        appLogger.warn(`Invalid date`, {
          sentryBreadcrumb: true,
          extra: {
            dateFr,
            minDate,
            maxDate,
          },
        });
        return helpers.error("any.invalid");
      }

      const date = momentDate.toDate();

      console.log("xxx date:", date);
      console.log("xxx minDate:", minDate);
      console.log("xxx maxDate:", maxDate);
      console.log("xxx Joi.isRef(minDate):", Joi.isRef(minDate));

      if (Joi.isRef(minDate)) {
        const ref = (minDate as any)(state.reference || state.parent);
        console.log("xxx ref:", ref);

        minDate = new Date(ref);
      }

      const isInvalidDate =
        (!!minDate && date >= minDate) || (!!maxDate && date <= maxDate);
      console.log("xxx isInvalidDate:", isInvalidDate);
      if (isInvalidDate) {
        appLogger.warn(`Invalid date`, {
          sentryBreadcrumb: true,
          extra: {
            dateFr,
            date,
            minDate,
            maxDate,
          },
        });
        return helpers.error("any.invalid");
      }
      return date;
    });
