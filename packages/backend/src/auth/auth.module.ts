import { forwardRef, Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/users.module";
import { UsersProviders } from "../users/users.providers";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: new ConfigService().get("SECRET"),
      signOptions: {
        expiresIn: 36000
      }
    }),
    forwardRef(() => UsersModule)
  ],
  providers: [AuthService]
})
export class AuthModule {}
