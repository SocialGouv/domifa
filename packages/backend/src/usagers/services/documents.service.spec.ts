import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";

import { UsersModule } from "../../users/users.module";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { DocumentsService } from "./documents.service";
import { UsagersService } from "./usagers.service";

describe("DocumentsService", () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, forwardRef(() => UsersModule)],
      providers: [
        UsagersService,
        CerfaService,
        DocumentsService,
        ...UsagersProviders,
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
