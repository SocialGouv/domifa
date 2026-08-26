import * as yup from "yup";
import { ValidationRegexp } from "./ValidationRegexp.data";

export function email() {
  return yup
    .string()
    .trim()
    .lowercase()
    .max(254)
    .email()
    .matches(ValidationRegexp.email);
}
