import { AppTestContext, AppTestHelper } from "../test";
import { FileManagerService } from "./file-manager.service";

describe("FileManagerService", () => {
  let service: FileManagerService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      providers: [FileManagerService],
    });
    service = context.module.get<FileManagerService>(FileManagerService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
