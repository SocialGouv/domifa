import { AppTestHelper } from "../../../../util/test";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("countAyantsDroits", async () => {
    const result = await usagerRepository.countAyantsDroits();

    expect(result).toBeGreaterThan(7);
  });
  it("countUsagers", async () => {
    const result = await usagerRepository.countUsagers();
    expect(result).toBeGreaterThan(13);
  });
});
