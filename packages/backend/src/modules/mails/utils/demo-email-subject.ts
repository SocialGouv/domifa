import { domifaConfig } from "../../../config";

const DEMO_SUBJECT_PREFIX = "[DEMO] ";

// Outside prod, real users can receive emails sent from a demo/review
// environment: tag the subject so they can tell it apart.
export function demoEmailSubject(
  subject: string | undefined
): string | undefined {
  if (!subject || domifaConfig().envId === "prod") {
    return subject;
  }

  if (subject.startsWith(DEMO_SUBJECT_PREFIX)) {
    return subject;
  }

  return `${DEMO_SUBJECT_PREFIX}${subject}`;
}
