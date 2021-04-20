import * as yup from "yup";
import { ValidationRegexp } from "./ValidationRegexp.data";

export function phone() {
  return yup
    .string()
    .trim()
    .matches(ValidationRegexp.phone)
    .transform((x) => (x ? x.replace(/\D/g, "") : undefined));
}
