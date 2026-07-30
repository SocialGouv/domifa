export type OtpPromptResult =
  | { kind: "submit"; code: string }
  | { kind: "resend" }
  | { kind: "cancel" }
  | { kind: "blocked" };
