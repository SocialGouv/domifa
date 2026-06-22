import { EnforceableQuotaKind } from "./behavioral-quota-enforcer.types";

// Machine-readable reason persisted in `BLOCK_USER.context.reason`. Re-used
// by the alert cron to surface the trigger in the email.
export const QUOTA_BLOCK_REASON: Record<EnforceableQuotaKind, string> = {
  USAGERS_DOCS_DOWNLOAD: "quota_docs_download",
  USAGERS_DELETE: "quota_usagers_delete",
};

// Human-readable label persisted in `BLOCK_USER.context.label`. Kept ASCII
// to match the convention used by the security alert email template.
export const QUOTA_BLOCK_LABEL: Record<EnforceableQuotaKind, string> = {
  USAGERS_DOCS_DOWNLOAD:
    "Quota de telechargement de documents dépassé pour la structure",
  USAGERS_DELETE:
    "Quota de suppression de domicilies dépassé pour la structure",
};
