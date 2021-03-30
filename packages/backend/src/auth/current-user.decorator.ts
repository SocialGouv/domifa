import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AppAuthUser } from "../_common/model";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AppAuthUser;
  }
);
