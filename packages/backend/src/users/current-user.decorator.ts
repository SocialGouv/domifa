import { createParamDecorator } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export const CurrentUser = createParamDecorator((data, req) => {
  return req.user;
});
