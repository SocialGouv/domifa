import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Usager } from "../../_common/model";

export const CurrentUsager = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.usager as Usager;
  }
);
