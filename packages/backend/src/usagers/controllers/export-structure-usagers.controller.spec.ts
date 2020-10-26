import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { StructuresModule } from "../../structures/structure.module";
import { CerfaService } from "../services/cerfa.service";
import { UsagersService } from "../services/usagers.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersProviders } from "../usagers.providers";
import { InteractionsModule } from "../../interactions/interactions.module";
import { ExportStructureUsagersController } from "./export-structure-usagers.controller";

describe("Export Controller", () => {
  let controller: ExportStructureUsagersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportStructureUsagersController],
      imports: [
        DatabaseModule,
        UsersModule,
        InteractionsModule,
        StructuresModule,
      ],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    }).compile();

    controller = module.get<ExportStructureUsagersController>(
      ExportStructureUsagersController
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  /*it("Date functions : ", () => {
    expect(controller).toBeDefined();
  });*/
});
