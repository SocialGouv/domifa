// Response to attaching the dedicated support account to a structure. No
// token here: the support account authenticates separately, through the
// normal email/password/OTP login flow — see support-session.service.ts.
export interface ActivateSupportSessionResponse {
  expiresAt: Date;
  structureId: number;
  structureNom: string;
}
