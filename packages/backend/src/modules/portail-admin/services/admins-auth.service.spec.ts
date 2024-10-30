import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "../../../auth/auth.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { PortailAdminModule } from "../portail-admin.module";
import { AdminsAuthService } from "./admins-auth.service";

describe("AdminsAuthService", () => {
  let service: AdminsAuthService;
  let context: AppTestContext;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secretOrPrivateKey: "secretKey",
          signOptions: {
            expiresIn: "12h",
          },
        }),
        UsersModule,
        StructuresModule,
        PortailAdminModule,
        AuthModule,
      ],
      providers: [AdminsAuthService],
    });
    service = context.module.get<AdminsAuthService>(AdminsAuthService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
