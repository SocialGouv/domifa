import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserStructureAuthenticated } from "../_common/model";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserStructureAuthenticated;
  }
);
