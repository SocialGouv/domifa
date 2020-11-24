import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { domifaConfig } from "../config";
import { StructuresModule } from "../structures/structure.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  controllers: [AuthController],
  exports: [PassportModule],
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: domifaConfig().security.jwtSecret,
      signOptions: {
        expiresIn: 36000,
      },
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
