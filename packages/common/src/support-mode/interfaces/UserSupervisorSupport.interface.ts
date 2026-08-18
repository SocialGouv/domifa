// Pointer to the supervisor's currently active support session, stored
// denormalized on user_supervisor for fast "one session at a time" checks.
export interface UserSupervisorSupport {
  structureId: number;
  startDate: Date;
}
