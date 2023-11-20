import { AppTestHelper } from "../../../util/test";
import { interactionRepository } from "./interactionRepository.service";

describe("interactionRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("get all interactions", async () => {
    const interactions = await interactionRepository.findBy({
      structureId: 1,
      usagerRef: 7,
    });
    expect(interactions.length).toEqual(8);
  });
});
