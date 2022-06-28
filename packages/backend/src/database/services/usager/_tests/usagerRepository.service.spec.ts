import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test";
import { usagerRepository } from "../usagerRepository.service";

describe("usagerRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("countAyantsDroits", async () => {
    const result = await usagerRepository.countAyantsDroits();
    expect(result).toEqual(7);
  });
  it("countUsagers", async () => {
    const result = await usagerRepository.countUsagers();
    expect(result).toEqual(13);
  });
});
