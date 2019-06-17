import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";
import { StructuresProviders } from "../structures/structures-providers";
import { StructuresService } from "../structures/structures.service";
import { UsersModule } from "./users.module";
import { UsersProviders } from "./users.providers";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, StructuresModule, UsersModule],
      providers: [UsersService, ...UsersProviders]
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
