import { Test, TestingModule } from "@nestjs/testing";
import { ExportController } from "./export.controller";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { StructuresModule } from "../../structures/structure.module";
import { CerfaService } from "../services/cerfa.service";
import { UsagersService } from "../services/usagers.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersProviders } from "../usagers.providers";

describe("Export Controller", () => {
  let controller: ExportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      imports: [DatabaseModule, UsersModule, StructuresModule],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
