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
    expect(result).toBeGreaterThanOrEqual(7);
  });
  it("countUsagers", async () => {
    const result = await usagerRepository.countUsagers();
    expect(result).toBeGreaterThanOrEqual(13);
  });
  it("countAllUsagers", async () => {
    const result = await usagerRepository.countTotalUsagers();
    expect(result).toBeGreaterThanOrEqual(20);
  });
});
