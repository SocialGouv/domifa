import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

describe("Stuctures Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuresController],
      imports: [DatabaseModule, UsersModule, UsagersModule],
      providers: [{ provide: StructuresService, useValue: {} }]
    }).compile();

    const controller = module.get<StructuresController>(StructuresController);
    expect(controller).toBeDefined();
  });
});
