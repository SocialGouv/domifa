import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "../config/config.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { StructuresModule } from "../structures/structure.module";

@Module({
  controllers: [AuthController],
  exports: [PassportModule],
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: new ConfigService().get("SECRET"),
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
