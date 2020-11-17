import { DatabaseModule } from "../../database/database.module";
import { StructuresModule } from "../../structures/structure.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsersModule } from "../users.module";
import { UsersProviders } from "../users.providers";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [DatabaseModule, StructuresModule, UsersModule],
      providers: [UsersService, ...UsersProviders],
    });
    service = context.module.get<UsersService>(UsersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

});
