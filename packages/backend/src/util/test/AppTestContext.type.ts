import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { AppTestAuthProfile } from "./AppTestAuthProfile.type";

export type AppTestContext = {
  module: TestingModule;
  app?: INestApplication;
  authToken?: string;
  user?: AppTestAuthProfile; // pour l'instant, seulement utilisé pour les tests http
};
