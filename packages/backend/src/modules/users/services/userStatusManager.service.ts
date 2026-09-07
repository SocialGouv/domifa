import { UserStatus } from "@domifa/common";
import { Not } from "typeorm";
import {
  userStructureRepository,
  userSupervisorRepository,
  userUsagerRepository,
} from "../../../database";
import { UserProfile } from "../../../_common/model";

export const userStatusManager = {
  markUserAsBlocked,
  markUserAsTemporarilyBlocked,
  clearTemporaryBlock,
  getUserStatusFromDb,
  getPasswordDatesFromDb,
  unblockUser,
  activateFromPending,
};

async function markUserAsBlocked({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<void> {
  const repo = getRepoFor(userProfile);
  await repo.update({ id: userId }, { status: "BLOCKED" });
}

// Soft-lock from the throttler. Never overwrites a definitive BLOCKED state.
async function markUserAsTemporarilyBlocked({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<void> {
  const repo = getRepoFor(userProfile);
  await repo.update(
    { id: userId, status: Not("BLOCKED") },
    { status: "TEMPORARILY_BLOCKED" }
  );
}

// Clears the temporary lock once the backoff window has elapsed.
async function clearTemporaryBlock({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<void> {
  const repo = getRepoFor(userProfile);
  await repo.update(
    { id: userId, status: "TEMPORARILY_BLOCKED" },
    { status: "ACTIVE" }
  );
}

async function unblockUser({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<void> {
  const repo = getRepoFor(userProfile);
  await repo.update({ id: userId }, { status: "ACTIVE" });
}

// Idempotent activation: PENDING accounts become ACTIVE on the first
// password set (creation flow). BLOCKED and TEMPORARILY_BLOCKED stay as-is —
// the `Equal("PENDING")` filter in WHERE makes this safe to call
// unconditionally after any successful password write.
async function activateFromPending({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<void> {
  const repo = getRepoFor(userProfile);
  await repo.update({ id: userId, status: "PENDING" }, { status: "ACTIVE" });
}

async function getUserStatusFromDb({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<UserStatus | null> {
  const repo = getRepoFor(userProfile);
  const row = await repo.findOne({
    where: { id: userId },
    select: { status: true },
  });
  return row?.status ?? null;
}

// Used by AppUserGuard to enforce the annual password-renewal policy
// (getPasswordChangeStatus) server-side, not just in the Angular guard.
async function getPasswordDatesFromDb({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<{ passwordLastUpdate: Date | null; createdAt: Date } | null> {
  const repo = getRepoFor(userProfile);
  const row = await repo.findOne({
    where: { id: userId },
    select: { passwordLastUpdate: true, createdAt: true },
  });
  return row
    ? { passwordLastUpdate: row.passwordLastUpdate, createdAt: row.createdAt }
    : null;
}

function getRepoFor(userProfile: UserProfile) {
  switch (userProfile) {
    case "structure":
      return userStructureRepository;
    case "supervisor":
      return userSupervisorRepository;
    case "usager":
      return userUsagerRepository;
    default:
      throw new Error(`Unknown userProfile: ${userProfile as string}`);
  }
}
