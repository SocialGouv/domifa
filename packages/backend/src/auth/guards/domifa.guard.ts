import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "../../config";

@Injectable()
export class DomifaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) { }

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return (
      user &&
      user.role === "admin" &&
      (user.structureId === 1 ||
        (this.configService.getEnvId() === "preprod" && user.structureId === 1))
    );
  }
}
