import { TestUserAdmin } from "../types";

const ALL: TestUserAdmin[] = [
  {
    uuid: "da01f451-9c4f-4f6c-98bb-c635277e33e7",
    id: 1,
    email: "preprod.domifa@fabrique.social.gouv.fr",
    password: "Azerty012345!",
  },
];
const BY_EMAIL = ALL.reduce((acc, user) => {
  acc[user.email] = user;
  return acc;
}, {} as { [email: string]: TestUserAdmin });

export const TESTS_USERS_ADMIN = {
  ALL,
  BY_EMAIL,
};
