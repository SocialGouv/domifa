import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secretOrPrivateKey: "secretKey",
          signOptions: {
            expiresIn: 3600,
          },
        }),
        UsersModule,
        StructuresModule,
      ],
      providers: [AuthService],
    });
    service = context.module.get<AuthService>(AuthService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
