import { AppTestHelper } from "../../../util/test";
import { structureRepository } from "./structureRepository.service";

describe("StructureRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("checkHardResetToken", async () => {
    const structure = await structureRepository.checkHardResetToken({
      userId: 3,
      token: "6V0XR2S",
    });
    expect(structure).toBeDefined();
    expect(structure.id).toEqual(3);
  });

  describe("findInactiveStructures", () => {
    const findIds = async (inactiveSince: string) =>
      (
        await structureRepository.findInactiveStructures(
          new Date(inactiveSince)
        )
      ).map(({ id }) => id);

    it("keeps a structure where one user logged in after the cutoff", async () => {
      // Structure 1: last login 2025-09-18
      expect(await findIds("2025-01-01")).not.toContain(1);
      expect(await findIds("2025-12-01")).toContain(1);
    });

    it("uses structure registration when no user ever logged in", async () => {
      // Structure 2: no users, registered 2020-11-17
      expect(await findIds("2020-11-01")).not.toContain(2);
      expect(await findIds("2020-12-01")).toContain(2);
      // Structure 4: one user created 2021-02-01, never logged in
      expect(await findIds("2021-01-15")).not.toContain(4);
      expect(await findIds("2021-03-01")).toContain(4);
    });

    it("uses the most recent user account creation", async () => {
      // Structure 3: last login 2021-12-06, last user created 2021-09-21
      expect(await findIds("2021-11-01")).not.toContain(3);
      expect(await findIds("2022-01-01")).toContain(3);
    });

    it("returns the reference and last login dates", async () => {
      const structures = await structureRepository.findInactiveStructures(
        new Date("2026-01-01")
      );
      const structure = structures.find(({ id }) => id === 2);
      expect(structure.lastLogin).toBeNull();
      expect(new Date(structure.referenceDate)).toEqual(
        new Date(structure.registrationDate)
      );
    });
  });
});
