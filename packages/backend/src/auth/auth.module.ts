import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { domifaConfig } from "../config";
import { AdminsAuthService } from "../_portail-admin/portail-admin-login/services/admins-auth.service";
import { UsagersAuthService } from "../_portail-usager/portail-usager-login/services/usagers-auth.service";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { StructuresAuthService } from "./services/structures-auth.service";
import { StructuresAuthController } from "./structures-auth.controller";

@Module({
  controllers: [StructuresAuthController],
  exports: [
    PassportModule,
    StructuresAuthService,
    AdminsAuthService,
    UsagersAuthService,
  ],
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    forwardRef(() =>
      JwtModule.register({
        secret: domifaConfig().security.jwtSecret,
        signOptions: {
          expiresIn: 36000,
        },
      })
    ),
    // forwardRef(() => UsersModule),
    // forwardRef(() => StructuresModule),
    // forwardRef(() => UsagersModule),
  ],
  providers: [
    JwtStrategy,
    StructuresAuthService,
    AdminsAuthService,
    UsagersAuthService,
  ],
})
export class AuthModule {}
