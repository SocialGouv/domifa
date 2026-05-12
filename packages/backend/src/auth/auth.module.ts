import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { domifaConfig } from "../config";
import { AdminsAuthService } from "../modules/portail-admin/services/admins-auth.service";
import { UsagersAuthService } from "../modules/portail-usagers/services/usagers-auth.service";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { SessionCleanerService } from "./services/session-cleaner.service";
import { SessionFingerprintService } from "./services/session-fingerprint.service";
import { StructuresAuthService } from "./services/structures-auth.service";
import { StructuresAuthController } from "./structures-auth.controller";

@Module({
  controllers: [StructuresAuthController],
  exports: [
    PassportModule,
    StructuresAuthService,
    AdminsAuthService,
    UsagersAuthService,
    SessionFingerprintService,
  ],
  imports: [
    PassportModule.register({
      defaultStrategy: "jwt",
      session: false,
      passReqToCallback: true,
    }),
    JwtModule.register({
      secret: domifaConfig().security.jwtSecret,
      signOptions: {
        expiresIn: "12h",
      },
    }),
  ],
  providers: [
    JwtStrategy,
    StructuresAuthService,
    AdminsAuthService,
    UsagersAuthService,
    SessionFingerprintService,
    SessionCleanerService,
  ],
})
export class AuthModule {}
