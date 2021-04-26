import * as yup from "yup";

export function booleanOuiNon() {
  return yup
    .boolean()
    .transform((value, originalValue) => {
      if (!originalValue) {
        return undefined;
      }
      const upper = originalValue.toUpperCase();
      if (upper === "OUI") {
        return true;
      } else if (upper === "NON") {
        return false;
      }
      return originalValue;
    })
    .oneOf([true, false]);
}
