import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { CerfaService } from "./services/cerfa.service";
import { UsagersService } from "./services/usagers.service";
import { UsagersController } from "./usagers.controller";
import { UsagersModule } from "./usagers.module";
import { UsagersProviders } from "./usagers.providers";

describe("Usagers Controller", () => {
  let app: TestingModule;
  let controller: UsagersController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [UsagersController],
      imports: [DatabaseModule, UsersModule],
      providers: [CerfaService, UsagersService, ...UsagersProviders]
    }).compile();

    controller = app.get<UsagersController>(UsagersController);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("GET by ID ", async () => {
    expect(await controller.findOne(1)).toBeDefined();
    try {
      await controller.findOne(30);
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }
  });

  it("GET Document  📁", async () => {
    try {
      await controller.getDocument(2, 10, null);
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }
  });
});
