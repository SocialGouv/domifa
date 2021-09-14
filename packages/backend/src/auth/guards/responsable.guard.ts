import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserStructureAuthenticated } from "../../_common/model";
import { authChecker } from "../auth-checker.service";

@Injectable()
export class ResponsableGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserStructureAuthenticated;

    return authChecker.checkRole(user, "admin", "responsable");
  }
}
