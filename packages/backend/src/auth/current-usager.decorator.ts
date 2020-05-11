import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUsager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usager;
  }
);
