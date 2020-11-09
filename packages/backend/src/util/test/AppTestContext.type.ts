import { TestingModule } from "@nestjs/testing";
import { Connection } from "typeorm";

export type AppTestContext = {
  module: TestingModule;
  postgresTypeormConnection: Connection;
};