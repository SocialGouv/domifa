import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

@Injectable()
export class AuthJwtService {
  constructor(public jwtService: JwtService) {}

  public sign(
    payload: string | Buffer | object,
    options?: JwtSignOptions
  ): string {
    return this.jwtService.sign(payload, options);
  }
}
