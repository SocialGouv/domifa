import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { structureRepository } from "./structureRepository.service";

describe("structureRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
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
