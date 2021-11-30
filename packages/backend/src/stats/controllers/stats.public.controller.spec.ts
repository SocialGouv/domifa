import { forwardRef } from "@nestjs/common";
import { InteractionsModule } from "../../interactions/interactions.module";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { AdminStructuresModule } from "../../_portail-admin/admin-structures/admin-structures.module";
import { StatsPublicController } from "./stats.public.controller";

describe("Stats Public Controller", () => {
  let controller: StatsPublicController;

  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StatsPublicController],
      imports: [
        forwardRef(() => AdminStructuresModule),
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
      ],
      providers: [],
    });
    controller = context.module.get<StatsPublicController>(
      StatsPublicController
    );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
