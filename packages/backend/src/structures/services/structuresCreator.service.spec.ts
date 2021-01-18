import { structureRepository } from "../../database";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StructuresModule } from "../structure.module";
import { StructureCreatorService } from "./structureCreator.service";

describe("Structure Creator Service", () => {
  let service: StructureCreatorService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [StructuresModule],
      providers: [],
    });
    service = context.module.get<StructureCreatorService>(
      StructureCreatorService
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("check token", async (done) => {
    const structureId = 2;
    const token =
      "adfbfe24ff6de1f4e7c0011ad05028f5a129ced7f120079d20c4adf21d89";
    await structureRepository.updateOne(
      {
        id: structureId,
      },
      { token }
    );
    const structure = await service.checkCreationToken({ structureId, token });
    expect(structure).toBeDefined();
    expect(structure.id).toEqual(2);
    const structure2 = await service.checkCreationToken({ structureId, token });
    expect(structure2).toBeUndefined(); // token has been clear
    done();
  });
});
