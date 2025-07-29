import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserSupervisorAuthenticated } from "../../../_common/model/users/user-supervisor";

export const CurrentSupervisor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
    return request.user as UserSupervisorAuthenticated;
  }
);
