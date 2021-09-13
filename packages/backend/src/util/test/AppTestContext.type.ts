import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { Connection } from "typeorm";

export type AppTestContext = {
  module: TestingModule;
  postgresTypeormConnection: Connection;
  app?: INestApplication;
  authToken?: string;
};
