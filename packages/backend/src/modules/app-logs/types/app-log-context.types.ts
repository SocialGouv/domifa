import {
  UserStatus,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";

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

export type UserSupervisorCrudLogContext = {
  // ADMIN_USER_CREATE | ADMIN_USER_DELETE
  userId: number; // identifiant utilisateur créé // supprimé // modifié
  role: UserSupervisorRole;
};

export type StructureUserCrudLogContext = {
  // ADMIN_PASSWORD_RESET
  userId: number; // identifiant utilisateur créé // supprimé // modifié
  role: UserStructureRole;
};

export type AdminUserRoleChangeLogContext = {
  // ADMIN_USER_ROLE_CHANGE
  userId: number;
  oldRole: UserSupervisorRole;
  newRole: UserSupervisorRole;
};

export type UserStructureRoleChangeLogContext = {
  // USER_ROLE_CHANGE
  userId: number;
  oldRole: UserStructureRole;
  newRole: UserStructureRole;
};

export type UserStructureCreateLogContext = {
  // USER_CREATE | USER_DELETE — structureId lives on the row, not in context
  userId: number;
  structureId?: number;
  role: UserStructureRole;
};

export type BlockUserByAdminLogContext = {
  // BLOCK_USER_BY_ADMIN — snapshot taken before mutation
  previousStatus: UserStatus;
  previousRole: UserStructureRole | UserSupervisorRole;
};
