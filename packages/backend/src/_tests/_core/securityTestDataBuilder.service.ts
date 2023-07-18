import { AppTestContext } from "../../util/test";
import { TESTS_USERS_STRUCTURE } from "./constants";
import { TestUserStructure } from "./types";

export const securityTestDataBuilder = {
  getUserStructureId,
  getOtherUserSameStructure,
  getUserOtherStructure,
};

function getUserStructureId(context: AppTestContext): number {
  return context.user?.structureId ?? 1; // user structureId (default to "1" if anonymous)
}

function getOtherUserSameStructure(context: AppTestContext): TestUserStructure {
  const structureId = getUserStructureId(context);
  return TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[structureId]?.find(
    (x) => x.uuid !== context.user?.userUUID
  );
}

function getUserOtherStructure(context: AppTestContext): TestUserStructure {
  const structureId = getUserStructureId(context);
  return TESTS_USERS_STRUCTURE.ALL.find(
    (x) => x.uuid !== context.user?.userUUID && x.structureId !== structureId
  );
}
