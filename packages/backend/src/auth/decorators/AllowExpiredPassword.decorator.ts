import { SetMetadata } from "@nestjs/common";

// Marks an endpoint as reachable by AppUserGuard even when the account's
// password renewal is overdue (getPasswordChangeStatus === "EXPIRED").
// Needed for edit-my-password itself: the JWT is still valid, only the
// password is stale, and this is the one call the user must be able to make
// to fix that.
export const AllowExpiredPassword = () =>
  SetMetadata("allowExpiredPassword", true);
