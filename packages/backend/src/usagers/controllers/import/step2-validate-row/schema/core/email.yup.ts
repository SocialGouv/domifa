import * as yup from "yup";
import { ValidationRegexp } from "./ValidationRegexp.data";

export function email() {
  return yup.string().trim().email().matches(ValidationRegexp.email);
}
