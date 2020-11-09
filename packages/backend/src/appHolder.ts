import { INestApplication } from "@nestjs/common";

export const appHolder: {
  app: INestApplication;
} = {
  app: undefined,
};
