import { UserSupervisorRole } from "../types";

export const USER_SUPERVISOR_ROLES_LABELS: {
  [key in UserSupervisorRole]: string;
} = {
  region: "Région",
  "super-admin-domifa": "Admins DomiFa",
  department: "Département",
  national: "DGCS",
};
