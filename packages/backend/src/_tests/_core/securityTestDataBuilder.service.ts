import { AppTestContext } from "../../util/test";
import {
  TESTS_USERS_STRUCTURE,
  TestUserStructure,
} from "./TESTS_USERS_STRUCTURE.type";

export const securityTestDataBuilder = {
  getUserStructureId,
  getOtherUserSameStructure,
  getUserOtherStructure,
};

function getUserStructureId(context: AppTestContext): number {
  const structureId = context.user?.structureId ?? 1; // user structureId (default to "1" if anonymous)
  return structureId;
}

function getOtherUserSameStructure(context: AppTestContext): TestUserStructure {
  const structureId = getUserStructureId(context);
  const user = TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[structureId]?.find(
    (x) => x.uuid !== context.user?.userUUID
  );
  return user;
}

function getUserOtherStructure(context: AppTestContext): TestUserStructure {
  const structureId = getUserStructureId(context);
  const user = TESTS_USERS_STRUCTURE.ALL.find(
    (x) => x.uuid !== context.user?.userUUID && x.structureId !== structureId
  );
  return user;
}
