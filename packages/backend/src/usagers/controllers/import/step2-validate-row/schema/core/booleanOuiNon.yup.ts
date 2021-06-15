import * as yup from "yup";

export function booleanOuiNon() {
  return yup
    .boolean()
    .transform((value, originalValue) => {
      if (originalValue && originalValue.toString) {
        const upper = originalValue.toString().toUpperCase();
        if (upper === "OUI") {
          return true;
        } else if (upper === "NON") {
          return false;
        }
      }
      return originalValue;
    })
    .oneOf([true, false]);
}
