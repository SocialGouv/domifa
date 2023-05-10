import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UsagerNote } from "../../_common/model";

export const CurrentUsagerNote = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usagerNote as UsagerNote;
  }
);
