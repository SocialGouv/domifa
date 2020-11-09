import { forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { DocumentsService } from "./documents.service";
import { UsagersService } from "./usagers.service";

describe("DocumentsService", () => {
  let service: DocumentsService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [DatabaseModule, forwardRef(() => UsersModule)],
      providers: [
        UsagersService,
        CerfaService,
        DocumentsService,
        ...UsagersProviders,
      ],
    });
    service = context.module.get<DocumentsService>(DocumentsService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
