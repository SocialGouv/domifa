import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  UserProfile,
  UserStructureAuthenticated,
  UserStructureRole,
} from "../../_common/model";
import { authChecker } from "../services/auth-checker.service";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserStructureAuthenticated;

    const allowUserStructureRoles = this.reflector.get<UserStructureRole[]>(
      "allowUserStructureRoles",
      context.getHandler()
    );
    if (allowUserStructureRoles?.length) {
      // check structure user roles
      return authChecker.checkRole(user, ...allowUserStructureRoles);
    }
    const allowUserProfiles = this.reflector.get<UserProfile[]>(
      "allowUserProfiles",
      context.getHandler()
    );
    if (allowUserProfiles?.length) {
      // check structure user roles
      return authChecker.checkProfile(user, ...allowUserProfiles);
    }
    // by default: DENY
    return false;
  }
}
