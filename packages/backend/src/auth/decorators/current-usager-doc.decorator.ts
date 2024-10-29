import { UsagerDoc } from "@domifa/common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUsagerDoc = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usagerDoc as UsagerDoc;
  }
);
