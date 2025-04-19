import { structureRepository } from "../../../../database";
import { AppTestHelper } from "../../../../util/test";
import { structureCreatorService } from "../structureCreator.service";

describe("Structure Creator Service", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("check token", async () => {
    const structureId = 2;
    const token =
      "adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89";
    await structureRepository.update({ id: structureId }, { token });

    const structureForTest = await structureRepository.findOneBy({
      id: structureId,
    });

    const structure = await structureCreatorService.checkCreationToken({
      uuid: structureForTest.uuid,
      token,
    });

    expect(structure).toBeDefined();
    expect(structure.id).toEqual(2);

    const structure2 = await structureCreatorService.checkCreationToken({
      uuid: structureForTest.uuid,
      token,
    });
    expect(structure2).toBeNull(); // token has been clear: ;
  });
});
