import { UserStructure } from "../../_common/model/user-structure/UserStructure.type";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentChosenUserStructure = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.chosenUserStructure as UserStructure;
  }
);
