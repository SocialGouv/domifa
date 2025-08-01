import { UserSupervisorAuthenticated } from "../model/users/user-supervisor";

export const USER_SUPERVISOR_AUTH: UserSupervisorAuthenticated = {
  id: 1,
  uuid: "admin-uuid-123",
  nom: "Admin",
  prenom: "Test",
  email: "admin@test.com",
  role: "national",
  verified: true,
  createdAt: new Date(),
  lastLogin: new Date(),
  acceptTerms: new Date(),
  _userProfile: "supervisor",
  _userId: 1,
};
