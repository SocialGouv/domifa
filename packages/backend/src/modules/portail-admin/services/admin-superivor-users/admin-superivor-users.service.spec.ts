import { Test, TestingModule } from "@nestjs/testing";
import { AdminSuperivorUsersService } from "./admin-superivor-users.service";

describe("AdminSuperivorUsersService", () => {
  let service: AdminSuperivorUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminSuperivorUsersService],
    }).compile();

    service = module.get<AdminSuperivorUsersService>(
      AdminSuperivorUsersService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
