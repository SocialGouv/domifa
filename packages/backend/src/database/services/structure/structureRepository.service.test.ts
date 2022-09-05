import { AppTestHelper } from "../../../util/test";
import { structureRepository } from "./StructureRepository.service";

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
});
