import { UsagerNote } from "@domifa/common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUsagerNote = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usagerNote as UsagerNote;
  }
);
