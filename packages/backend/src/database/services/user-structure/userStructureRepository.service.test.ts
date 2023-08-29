import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { newUserStructureRepository } from "./userStructureRepository.service";

describe("newUserStructureRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("count structure users", async () => {
    const count1 = await newUserStructureRepository.count({
      where: {
        structureId: 1,
      },
    });
    // be sure the count is ok
    expect(count1).toEqual(
      TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[1]?.length ?? 0
    );

    const count2 = await newUserStructureRepository.count({
      where: {
        structureId: 2,
      },
    });
    // be sure the count is ok
    expect(count2).toEqual(
      TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[2]?.length ?? 0
    );

    const countTotal = await newUserStructureRepository.count();
    // be sure the count is ok
    expect(countTotal).toEqual(TESTS_USERS_STRUCTURE.ALL.length);
  });
  it("findVerifiedStructureUsersByRoles returns matching users", async () => {
    const users =
      await newUserStructureRepository.findVerifiedStructureUsersByRoles({
        structureId: 1,
        roles: ["admin", "simple", "responsable"],
      });
    expect(users).toBeDefined();

    // be sure the count is ok
    expect(users.length).toEqual(3);
  });

  it("findOne returns matching user", async () => {
    const user1 = await newUserStructureRepository.findOneBy({
      id: 1,
    });
    expect(user1).toBeDefined();

    // be sure the user id is ok
    expect(user1.id).toEqual(1);
  });

  it("findOne returns matching user", async () => {
    const user1 = await newUserStructureRepository.findOneBy({
      id: 1,
    });
    expect(user1).toBeDefined();
    expect(user1.id).toEqual(1);
    await newUserStructureRepository.update({ id: 1 }, { nom: "test name" });

    const user2 = await newUserStructureRepository.findOneBy({ id: 1 });
    expect(user2).toBeDefined();
    expect(user2.nom).toEqual("test name");
    // restore original name
    await newUserStructureRepository.update({ id: 1 }, { nom: user1.nom });
  });
});
