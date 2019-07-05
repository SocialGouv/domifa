import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsagersProviders } from "../usagers/usagers.providers";
import { UsersModule } from "../users/users.module";
import { InteractionsController } from "./interactions.controller";
import { InteractionDto } from "./interactions.dto";
import { InteractionsProviders } from "./interactions.providers";
import { InteractionsService } from "./interactions.service";

describe("Interactions Controller", () => {
  let app: TestingModule;
  let controller: InteractionsController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [InteractionsController],
      imports: [DatabaseModule, UsersModule, UsagersModule],
      providers: [InteractionsService, ...InteractionsProviders]
    }).compile();
    controller = app.get<InteractionsController>(InteractionsController);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("GET by ID ", async () => {
    const interaction = new InteractionDto();
    interaction.type = "courrierOut";
    interaction.content = "Les impôts";

    try {
      const testFc = await controller.postInteraction(1, interaction);
      expect(testFc).toBeDefined();
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }

    try {
      expect(await controller.postInteraction(100, interaction)).toBeDefined();
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }

    try {
      expect(await controller.setPassage(1, "passage")).toBeDefined();
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }

    try {
      expect(await controller.setPassage(100, "passage")).toBeDefined();
    } catch (err) {
      expect(err.message).toEqual("NOT_FOUND");
    }
  });
});
