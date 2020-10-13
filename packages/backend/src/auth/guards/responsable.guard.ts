import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../users/user-role.type";

@Injectable()
export class ResponsableGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user && (user.role === "admin" || user.role === "responsable");
  }
}
