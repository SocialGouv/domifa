import { Test, TestingModule } from "@nestjs/testing";
import { DocsController } from "./docs.controller";
import { DatabaseModule } from "../../database/database.module";
import { forwardRef } from "@nestjs/common";
import { UsersModule } from "../../users/users.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../usagers.module";
import { InteractionsModule } from "../../interactions/interactions.module";
import { CerfaService } from "../services/cerfa.service";
import { UsagersService } from "../services/usagers.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersProviders } from "../usagers.providers";

describe("Docs Controller", () => {
  let controller: DocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocsController],
      imports: [
        DatabaseModule,
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [
        CerfaService,
        UsagersService,
        DocumentsService,
        ...UsagersProviders,
      ],
    }).compile();

    controller = module.get<DocsController>(DocsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
