import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsersModule } from "../../users/users.module";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";
import { UsagersProviders } from "../usagers.providers";
import { ImportController } from "./import.controller";

describe("Import Controller", () => {
  let controller: ImportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      imports: [DatabaseModule, UsersModule, StructuresModule],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders
      ]
    }).compile();

    controller = module.get<ImportController>(ImportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
