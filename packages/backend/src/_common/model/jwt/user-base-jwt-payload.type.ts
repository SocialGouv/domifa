import { UserProfile } from "../users/common-user/UserProfile.type";

export interface UseBaseJwtPayload<T extends UserProfile = UserProfile> {
  _userProfile: T;
  _userId: number;
  _jwtPayloadVersion: number;
  userId: number;
  lastLogin: Date;
}
