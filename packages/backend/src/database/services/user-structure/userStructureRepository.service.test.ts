import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { userStructureRepository } from "./userStructureRepository.service";

describe("userStructureRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("count returns users count", async () => {
    const count1 = await userStructureRepository.count({
      where: {
        structureId: 1,
      },
    });
    // be sure the count is ok
    expect(count1).toEqual(4);

    const count2 = await userStructureRepository.count({
      where: {
        structureId: 2,
      },
    });
    // be sure the count is ok
    expect(count2).toEqual(0);

    const countTotal = await userStructureRepository.count();
    // be sure the count is ok
    expect(countTotal).toBeGreaterThan(4);
  });
  it("findVerifiedStructureUsersByRoles returns matching users", async () => {
    const users =
      await userStructureRepository.findVerifiedStructureUsersByRoles({
        structureId: 1,
        roles: ["admin", "simple", "responsable"],
      });
    expect(users).toBeDefined();

    // be sure the count is ok
    expect(users.length).toEqual(3);
  });
  it("findAll returns matching user", async () => {
    const users = await userStructureRepository.findMany({
      structureId: 1,
    });
    expect(users).toBeDefined();

    // be sure the count is ok
    expect(users.length).toEqual(4);
  });
  it("findOne returns matching user", async () => {
    const user1 = await userStructureRepository.findOne({
      id: 1,
    });
    expect(user1).toBeDefined();

    // be sure the user id is ok
    expect(user1.id).toEqual(1);
  });

  it("findOne returns matching user", async () => {
    const user1 = await userStructureRepository.findOne({
      id: 1,
    });
    expect(user1).toBeDefined();
    expect(user1.id).toEqual(1);
    const user2 = await userStructureRepository.updateOne(
      {
        id: 1,
      },
      {
        nom: "test name",
      }
    );

    expect(user2).toBeDefined();
    expect(user2.nom).toEqual("test name");
    // restore original name
    await userStructureRepository.updateOne(
      {
        id: 1,
      },
      {
        nom: user1.nom,
      }
    );
  });
});
