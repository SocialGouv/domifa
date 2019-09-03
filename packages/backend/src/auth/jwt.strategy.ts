import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "../config/config.service";
import { AuthService } from "./auth.service";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger("JWTstrategy");
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: new ConfigService().get("SECRET")
    });
  }
  public async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      this.logger.log("PATATE");
      return new UnauthorizedException();
    }
    this.logger.log("USER");
    return user;
  }
}
