import { createParamDecorator } from "@nestjs/common";

export const CurrentUsager = createParamDecorator((data, req) => {
  return req.usager;
});
