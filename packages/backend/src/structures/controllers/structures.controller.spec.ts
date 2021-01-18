import { HttpStatus } from "@nestjs/common";
import { DatabaseModule } from "../../database";
import { InteractionsModule } from "../../interactions/interactions.module";
import { MailsModule } from "../../mails/mails.module";
import { StatsModule } from "../../stats/stats.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { ExpressResponse } from "../../util/express";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StructuresModule } from "../structure.module";
import { StructuresController } from "./structures.controller";

describe("Stuctures Controller", () => {
  let context: AppTestContext;
  let controller: StructuresController;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [],
      imports: [
        DatabaseModule,
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
        StatsModule,
        StructuresModule,
      ],
      providers: [],
    });
    controller = context.module.get<StructuresController>(StructuresController);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(controller).toBeDefined();
  });

  it("validateEmail does not exists", async () => {
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;

    await controller.validateEmail(
      {
        email: "test-mail-does-not-exists@yopmail.com",
      },
      res
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(false);
  });

  it("validateEmail exists", async () => {
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;

    await controller.validateEmail(
      {
        email: "ccastest@yopmail.com",
      },
      res
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(true);
  });
});
