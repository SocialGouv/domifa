import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { CommonInteraction } from "@domifa/common";

export const CurrentInteraction = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.interaction as CommonInteraction;
  }
);
