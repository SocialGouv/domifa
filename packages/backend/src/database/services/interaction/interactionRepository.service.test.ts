import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { interactionRepository } from "./interactionRepository.service";

describe("interactionRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("get all interactions", async () => {
    {
      const interactions = await interactionRepository.findWithFilters({
        structureId: 1,
        usagerRef: 7,
      });

      expect(interactions.length).toEqual(8);
    }
    {
      const interactions = await interactionRepository.findWithFilters({
        structureId: 1,
        usagerRef: 7,
        maxResults: 3,
      });

      expect(interactions.length).toEqual(3);
    }
  });

  it("get all interactions to distribute", async () => {
    {
      const interactionsToDistribute =
        await interactionRepository.findWithFilters({
          structureId: 1,
          usagerRef: 7,
          filter: "distribution",
        });

      expect(interactionsToDistribute.length).toEqual(3);
    }
    {
      const interactionsToDistribute =
        await interactionRepository.findWithFilters({
          structureId: 1,
          usagerRef: 7,
          filter: "distribution",
          maxResults: 2,
        });

      expect(interactionsToDistribute.length).toEqual(2);
    }
  });
});
