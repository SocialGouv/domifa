import { UserSupervisorRole } from "@domifa/common";

export type FailedUsagerImportLogContext = {
  // IMPORT_USAGERS_FAILED
  nombreActifs: number;
  nombreErreurs: number;
  nombreTotal: number;
};

export type SuccessfulUsagerImportLogContext = {
  // IMPORT_USAGERS_SUCCESS
  nombreActifs: number;
  nombreTotal: number;
};

export type AdminUserCrudLogContext = {
  // ADMIN_USER_CREATE | ADMIN_USER_DELETE | ADMIN_PASSWORD_RESET
  userId: number; // identifiant utilisateur créé // supprimé // modifié
  role: UserSupervisorRole;
};

export type AdminUserRoleChangeLogContext = {
  // ADMIN_USER_ROLE_CHANGE
  userId: number;
  oldRole: UserSupervisorRole;
  newRole: UserSupervisorRole;
};
