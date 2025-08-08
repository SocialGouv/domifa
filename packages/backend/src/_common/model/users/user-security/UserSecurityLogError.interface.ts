import { UserProfile } from "../common-user";

export interface UserSecurityLogError {
  operation: string;
  userId: number;
  userProfile?: UserProfile;
}
