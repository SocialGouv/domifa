import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  UserAuthenticated,
  UserProfile,
  UserStructureAuthenticated,
  UserStructureRole,
} from "../../_common/model";
import { authChecker } from "../services";

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserAuthenticated;

    let allowUserProfiles = this.reflector.get<UserProfile[]>(
      "allowUserProfiles",
      context.getHandler()
    );
    const allowUserStructureRoles = this.reflector.get<UserStructureRole[]>(
      "allowUserStructureRoles",
      context.getHandler()
    );
    if (!allowUserProfiles?.length && allowUserStructureRoles?.length) {
      allowUserProfiles = ["structure"];
    }
    if (allowUserProfiles?.length) {
      // check structure user roles
      const isValidProfile = authChecker.checkProfile(
        user,
        ...allowUserProfiles
      );
      if (isValidProfile) {
        if (
          user._userProfile === "structure" &&
          allowUserStructureRoles?.length
        ) {
          // check structure user roles
          return (
            authChecker.checkProfile(user, "structure") &&
            authChecker.checkRole(
              user as UserStructureAuthenticated,
              ...allowUserStructureRoles
            )
          );
        }
      }
      return isValidProfile;
    }

    // by default: DENY
    return false;
  }
}
