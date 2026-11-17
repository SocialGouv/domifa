import { AppTestHelper } from "../../../util/test";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { myDataSource } from "../_postgres";
import { userStructureRepository } from "./userStructureRepository.service";

describe("userStructureRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("count structure users", async () => {
    const count1 = await userStructureRepository.count({
      where: {
        structureId: 1,
      },
    });
    // be sure the count is ok
    expect(count1).toEqual(
      TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[1]?.length ?? 0
    );

    const count2 = await userStructureRepository.count({
      where: {
        structureId: 2,
      },
    });
    // be sure the count is ok
    expect(count2).toEqual(
      TESTS_USERS_STRUCTURE.BY_STRUCTURE_ID[2]?.length ?? 0
    );

    const countTotal = await userStructureRepository.count();
    // be sure the count is ok
    expect(countTotal).toEqual(TESTS_USERS_STRUCTURE.ALL.length);
  });
  it("findStructureUsersByRoles returns matching users", async () => {
    const users = await userStructureRepository.findStructureUsersByRoles({
      structureId: 1,
      roles: ["admin", "simple", "responsable"],
    });
    expect(users).toBeDefined();

    // be sure the count is ok
    expect(users.length).toEqual(3);
  });

  it("findOne returns matching user", async () => {
    const user1 = await userStructureRepository.findOneBy({
      id: 1,
    });
    expect(user1).toBeDefined();

    // be sure the user id is ok
    expect(user1.id).toEqual(1);
  });

  it("findOne returns matching user", async () => {
    const user1 = await userStructureRepository.findOneBy({
      id: 1,
    });
    expect(user1).toBeDefined();
    expect(user1.id).toEqual(1);
    await userStructureRepository.update({ id: 1 }, { nom: "test name" });

    const user2 = await userStructureRepository.findOneBy({ id: 1 });
    expect(user2).toBeDefined();
    expect(user2.nom).toEqual("test name");
    // restore original name
    await userStructureRepository.update({ id: 1 }, { nom: user1.nom });
  });

  describe("findInactiveUsers", () => {
    const CUTOFF = new Date("2024-01-01");

    // Fixtures live in a rolled back transaction: other test files count
    // user_structure rows in parallel.
    it("selects inactive users of structures that are still active", async () => {
      const queryRunner = myDataSource.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        const insert = async (
          structureId: number,
          createdAt: string,
          lastLogin: string | null,
          status = "ACTIVE"
        ): Promise<number> => {
          const [{ id }] = await queryRunner.query(
            `INSERT INTO user_structure
              (email, nom, prenom, password, "structureId", status, version, "createdAt", "lastLogin")
            VALUES ($1, 'Inactif', 'Test', 'x', $2, $3, 1, $4, $5)
            RETURNING id`,
            [
              `inactive-${structureId}-${createdAt}@yopmail.com`,
              structureId,
              status,
              new Date(createdAt),
              lastLogin ? new Date(lastLogin) : null,
            ]
          );
          return id;
        };

        // Structure 1 stays active thanks to "active"
        const oldLogin = await insert(1, "2021-01-01", "2023-06-01");
        const neverConnected = await insert(1, "2022-01-01", null);
        const recentlyCreated = await insert(1, "2024-03-01", null);
        const active = await insert(1, "2021-02-01", "2024-06-01");
        const alreadyDeleted = await insert(
          1,
          "2020-12-01",
          "2021-01-01",
          "DELETE"
        );
        // Structure 2 has no other user: left to the inactive structures cron
        const wholeStructureInactive = await insert(
          2,
          "2021-01-01",
          "2022-01-01"
        );

        const users = await queryRunner.manager
          .withRepository(userStructureRepository)
          .findInactiveUsers(CUTOFF);
        const ids = users.map(({ id }) => id);

        expect(ids).toEqual(expect.arrayContaining([oldLogin, neverConnected]));
        expect(ids).not.toContain(recentlyCreated);
        expect(ids).not.toContain(active);
        expect(ids).not.toContain(alreadyDeleted);
        expect(ids).not.toContain(wholeStructureInactive);

        const neverConnectedUser = users.find(
          ({ id }) => id === neverConnected
        );
        expect(neverConnectedUser.lastLogin).toBeNull();
        expect(new Date(neverConnectedUser.referenceDate)).toEqual(
          new Date("2022-01-01")
        );
        expect(neverConnectedUser.structureNom).toBeDefined();
      } finally {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
      }
    });
  });
});
