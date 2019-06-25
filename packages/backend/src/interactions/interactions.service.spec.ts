import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { InteractionDto } from "./interactions.dto";
import { InteractionsModule } from "./interactions.module";
import { InteractionsProviders } from "./interactions.providers";
import { InteractionsService } from "./interactions.service";

describe("InteractionsService", () => {
  let service: InteractionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        InteractionsModule,
        UsagersModule,
        UsersModule,
        StructuresModule
      ],
      providers: [InteractionsService, ...InteractionsProviders]
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("new DTO ", () => {
    const interaction = new InteractionDto();
    expect(interaction).toBeDefined();
  });
});
