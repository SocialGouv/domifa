import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { domifaConfig } from "../config";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { AuthJwtService } from "./services/auth-jwt-service";
import { StructuresAuthService } from "./services/structures-auth.service";
import { StructuresAuthController } from "./structures-auth.controller";

@Module({
  controllers: [StructuresAuthController],
  exports: [PassportModule, AuthJwtService],
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
  providers: [StructuresAuthService, AuthJwtService, JwtStrategy],
})
export class AuthModule {}
