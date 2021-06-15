import { oneOfString } from "./oneOfString.yup";

export const typeDomSchema = oneOfString(["PREMIERE_DOM", "RENOUVELLEMENT"], {
  transform: (value, originalValue) => {
    return originalValue === "PREMIERE"
      ? "PREMIERE_DOM"
      : value === "RENOUVELLEMENT"
      ? value
      : "invalid";
  },
});
