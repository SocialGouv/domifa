import { oneOfString } from "./oneOfString.yup";

export const typeDomSchema = oneOfString(["PREMIERE_DOM", "RENOUVELLEMENT"], {
  transform: (value, originalValue) => {
    return originalValue === "PREMIERE" || originalValue === "PREMIERE_DOM"
      ? "PREMIERE_DOM"
      : value === "RENOUVELLEMENT"
      ? value
      : "invalid";
  },
});
