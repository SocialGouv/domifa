import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserStructureAuthenticated } from "../../_common/model";

export const CurrentStructureInformation = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.structureInformation as UserStructureAuthenticated;
  }
);
