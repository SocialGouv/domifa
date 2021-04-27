import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UsagerLight } from "../_common/model";

export const CurrentUsager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usager as UsagerLight;
  }
);
