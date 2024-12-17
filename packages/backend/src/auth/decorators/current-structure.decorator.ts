import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Structure } from "@domifa/common";

export const CurrentStructure = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.structure as Structure;
  }
);
