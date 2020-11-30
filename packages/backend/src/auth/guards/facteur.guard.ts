import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppUser } from "../../_common/model";
import { authChecker } from "../auth-checker.service";

@Injectable()
export class FacteurGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AppUser;
    return authChecker.checkRole(user, "admin", "responsable", "simple");
  }
}
