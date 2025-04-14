import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { StructuresModule } from "../../modules/structures/structure.module";
import { UsersModule } from "../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StructuresAuthService } from "./structures-auth.service";

describe("StructuresAuthService", () => {
  let service: StructuresAuthService;
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
      ],
      providers: [StructuresAuthService],
    });
    service = context.module.get<StructuresAuthService>(StructuresAuthService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
