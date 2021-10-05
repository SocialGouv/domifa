import { UserProfile } from "../../_common/model";

export interface UseBaseJwtPayload<T extends UserProfile = UserProfile> {
  _userProfile: T;
  _userId: number;
  _jwtPayloadVersion: number;
}
