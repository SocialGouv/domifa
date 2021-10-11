import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "../../../auth/auth.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { PortailUsagerModule } from "../../portail-usager.module";
import { UsagersAuthService } from "./usagers-auth.service";

describe("UsagersAuthService", () => {
  let service: UsagersAuthService;
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
        PortailUsagerModule,
        AuthModule,
      ],
      providers: [UsagersAuthService],
    });
    service = context.module.get<UsagersAuthService>(UsagersAuthService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
