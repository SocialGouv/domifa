import * as yup from "yup";
import { ValidationRegexp } from "./ValidationRegexp.data";

export function email() {
  return yup.string().trim().matches(ValidationRegexp.email).email();
}
