import { UserStructure, UserStructureRole } from "../../_common/model";

export type TestUserStructure = Pick<
  UserStructure,
  "uuid" | "id" | "structureId" | "email" | "role" | "password"
>;

const ALL: TestUserStructure[] = [
  {
    uuid: "da01f451-9c4f-4f6c-98bb-c635277e33e7",
    id: 1,
    structureId: 1,
    email: "ccastest@yopmail.com",
    password: "Azerty012345",
    role: "admin",
  },
  {
    uuid: "663b9baa-2880-406c-a93a-32fe65528037",
    id: 2,
    structureId: 1,
    email: "justeisabelle@yopmail.com",
    password: "Azerty012345",
    role: "simple",
  },
  {
    uuid: "b0140303-79e3-436c-9c41-1eaefeeaed6e",
    id: 3,
    structureId: 1,
    email: "peter.smith@yopmail.com",
    password: "Azerty012345",
    role: "responsable",
  },
  {
    uuid: "d19ece1f-d32b-498c-9427-eb12b1251163",
    id: 4,
    structureId: 1,
    email: "facteur.test@yopmail.com",
    password: "Azerty012345",
    role: "facteur",
  },
  {
    uuid: "d81c5566-94f9-4ee4-ab57-a604a654f79b",
    id: 5,
    structureId: 3,
    email: "roseline.parmentier@yopmail.com",
    password: "Azerty012345",
    role: "admin",
  },
  {
    uuid: "59c846d8-0592-4790-a5e2-1daae9b8776e",
    id: 6,
    structureId: 1,
    email: "structure-1.facteur-1@yopmail.com",
    password: "Azerty012345",
    role: "facteur",
  },
  {
    uuid: "44f1cfe8-eae9-49d5-aedb-76dda856c413",
    id: 7,
    structureId: 4,
    email: "test.import@yopmail.com",
    password: "Azerty012345",
    role: "admin",
  },
  {
    uuid: "4e049e3d-bb65-48e5-8661-b1ccdc9db985",
    id: 8,
    structureId: 3,
    email: "simple-testeur@yopmail.com",
    password: "Azerty012345",
    role: "simple",
  },
];

const BY_EMAIL = ALL.reduce((acc, user) => {
  acc[user.email] = user;
  return acc;
}, {} as { [email: string]: TestUserStructure });

const BY_ROLE = ALL.reduce((acc, user) => {
  if (!acc[user.role]) {
    acc[user.role] = [];
  }
  acc[user.role].push(user);
  return acc;
}, {} as { [role in UserStructureRole]: TestUserStructure[] });

const BY_STRUCTURE_ID = ALL.reduce((acc, user) => {
  if (!acc[user.structureId]) {
    acc[user.structureId] = [];
  }
  acc[user.structureId].push(user);
  return acc;
}, {} as { [structureId: string]: TestUserStructure[] });

export const TESTS_USERS_STRUCTURE = {
  ALL,
  BY_EMAIL,
  BY_ROLE,
  BY_STRUCTURE_ID,
};
