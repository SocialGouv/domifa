import { UserProfile } from "./UserProfile.type";

export type UserAuthenticated<T extends UserProfile = UserProfile> = {
  _userProfile: T;
  _userId: number;
};
