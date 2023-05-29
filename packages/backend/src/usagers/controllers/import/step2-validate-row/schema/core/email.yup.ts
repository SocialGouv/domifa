import * as yup from "yup";

export function email() {
  return yup.string().trim().email();
}
