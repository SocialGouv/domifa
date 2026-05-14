import { createHash } from "node:crypto";
import { EntityManager } from "typeorm";

// Acquires a Postgres transaction-scoped advisory lock keyed on a string.
// Multiple callers requesting the lock with the same key serialize until
// the holding transaction commits or rolls back. The lock is released
// automatically on transaction end — no manual release required.
//
// Usage:
//   await dataSource.transaction(async (manager) => {
//     await acquireAdvisoryXactLock(manager, "otp:<scope>");
//     // ... critical section
//   });
//
// Postgres exposes pg_advisory_xact_lock in two forms: (bigint) and
// (int4, int4). We use the 2-int form so the params fit Node's signed
// int32 range without BigInt round-trips. The key is sha256-hashed first
// so any string is accepted and unrelated keys collide with negligible
// probability (≈ 2^-64).
export async function acquireAdvisoryXactLock(
  manager: EntityManager,
  key: string
): Promise<void> {
  const digest = createHash("sha256").update(key).digest("hex");
  // `| 0` reinterprets the unsigned 32-bit value as signed int32, which is
  // what Postgres expects for the int4 args.
  const k1 = parseInt(digest.slice(0, 8), 16) | 0;
  const k2 = parseInt(digest.slice(8, 16), 16) | 0;
  await manager.query("SELECT pg_advisory_xact_lock($1, $2)", [k1, k2]);
}
