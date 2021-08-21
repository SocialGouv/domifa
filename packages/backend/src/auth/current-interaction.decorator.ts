import { Interactions } from "./../_common/model/interaction/Interactions.type";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentInteraction = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.interaction as Interactions;
  }
);
