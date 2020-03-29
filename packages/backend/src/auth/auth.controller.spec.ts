import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("Auth Controller", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [DatabaseModule, forwardRef(() => UsersModule), UsagersModule],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compile();

    const controller = module.get<AuthController>(AuthController);

    expect(controller).toBeDefined();
  });
});
