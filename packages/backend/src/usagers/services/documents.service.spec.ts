import { forwardRef } from "@nestjs/common";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { DocumentsService } from "./documents.service";
import { UsagersService } from "./usagers.service";

describe("DocumentsService", () => {
  let service: DocumentsService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule)],
      providers: [UsagersService, DocumentsService],
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
