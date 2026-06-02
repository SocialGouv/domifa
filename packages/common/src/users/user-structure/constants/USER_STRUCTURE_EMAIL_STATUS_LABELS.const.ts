import { UserStructureEmailStatus } from "../types";

export const USER_STRUCTURE_EMAIL_STATUS_LABELS: {
  [key in UserStructureEmailStatus]: string;
} = {
  GENERIC_CONFIRMED: "Générique confirmé",
  GENERIC_SUSPECTED: "Générique supposé",
  PERSONAL: "Mail personnel",
};
