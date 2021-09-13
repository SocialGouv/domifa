import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UsagerNoteController } from "./usager-note.controller";

describe("UsagerNote Controller", () => {
  let controller: UsagerNoteController;

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerNoteController],
      imports: [UsersModule],
      providers: [],
    });
    controller = context.module.get<UsagerNoteController>(UsagerNoteController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
