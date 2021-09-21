import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Interactions } from "../../_common/model";

export const CurrentInteraction = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.interaction as Interactions;
  }
);
