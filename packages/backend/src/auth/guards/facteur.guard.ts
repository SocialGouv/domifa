import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../users/user.interface";
import { UserRole } from "../../users/user-role.type";

@Injectable()
export class FacteurGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    return (
      user &&
      (user.role === "admin" ||
        user.role === "responsable" ||
        user.role === "simple")
    );
  }
}
