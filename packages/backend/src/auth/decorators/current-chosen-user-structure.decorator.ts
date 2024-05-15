import { UserStructure } from "@domifa/common";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentChosenUserStructure = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.chosenUserStructure as UserStructure;
  }
);
