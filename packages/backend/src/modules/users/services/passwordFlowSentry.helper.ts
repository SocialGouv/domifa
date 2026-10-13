import { captureMessage } from "@sentry/nestjs";

import { UserProfile } from "../../../_common/model";

type DriverError = {
  code?: string;
  table?: string;
  column?: string;
  constraint?: string;
};

// Reports an unexpected failure of a password flow (change, renewal, reset)
// to Sentry with the step that failed. Only non-sensitive identifiers are
// sent: never a password, a hash, a token or an email. A fixed message per
// step keeps Sentry from creating one issue per user.
export function capturePasswordFlowFailure({
  flow,
  step,
  userProfile,
  userId,
  structureId,
  error,
}: {
  flow: string;
  step: string;
  userProfile: UserProfile;
  userId?: number;
  structureId?: number;
  error: unknown;
}): void {
  try {
    const err = error as Error & {
      driverError?: DriverError;
      passwordFlowStep?: string;
    };
    const driverError = err?.driverError;
    const fullStep = err?.passwordFlowStep
      ? `${step}/${err.passwordFlowStep}`
      : step;

    captureMessage(`[PASSWORD] ${flow} failed at step "${fullStep}"`, {
      level: "error",
      tags: {
        flow,
        step: fullStep,
        userProfile,
        errorName: err?.name ?? typeof error,
        pgCode: driverError?.code,
      },
      extra: {
        userId,
        structureId,
        errorMessage: err?.message ?? String(error),
        pgTable: driverError?.table,
        pgColumn: driverError?.column,
        pgConstraint: driverError?.constraint,
      },
    });
  } catch {
    // Reporting must never change the outcome of the password flow.
  }
}
