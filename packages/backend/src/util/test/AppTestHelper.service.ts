import { myDataSource } from "./../../database/services/_postgres/appTypeormManager.service";
import {
  HttpStatus,
  INestApplication,
  ModuleMetadata,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";
import { DataSource } from "typeorm";
import { appTypeormManager } from "../../database";
import {
  AppTestHttpClientSecurityTestDef,
  TestUserAdmin,
  TestUserStructure,
  TestUserUsager,
} from "../../_tests";

import { AppTestContext } from "./AppTestContext.type";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
  bootstrapTestConnection,
  tearDownTestConnection,
  authenticateUsager,
  authenticateStructure,
  authenticateSuperAdmin,
  filterSecurityTests,
};

async function bootstrapTestApp(
  metadata: ModuleMetadata,
  initApp: { initApp?: boolean } = { initApp: false }
): Promise<AppTestContext> {
  await bootstrapTestConnection();

  const module = await Test.createTestingModule(metadata).compile();
  const context: AppTestContext = {
    module,
    app: undefined,
  };

  if (initApp) {
    context.app = module.createNestApplication();

    context.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );
    await context.app.init();
  }
  return context;
}
async function tearDownTestConnection(): Promise<void> {
  setTimeout(async () => {
    await myDataSource.destroy();
  }, 200);
}

async function tearDownTestApp({ module }: AppTestContext): Promise<void> {
  await module.close();
  setTimeout(async () => {
    await myDataSource.destroy();
  }, 200);
}

async function bootstrapTestConnection(): Promise<DataSource> {
  return await appTypeormManager.connect({
    reuseConnexion: true,
    overrideConfig: {
      poolMaxConnections: 1,
    },
  });
}

async function authenticateStructure(
  authInfo: TestUserStructure,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);

  const response = await supertest(app.getHttpServer())
    .post("/structures/auth/login")
    .send({
      email: authInfo.email,
      password: authInfo.password,
    });

  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.access_token;
  context.user = {
    profile: "structure",
    structureRole: authInfo.role,
    structureId: authInfo.structureId,
    userId: authInfo.id,
    userUUID: authInfo.uuid,
  };
}
async function authenticateUsager(
  authInfo: TestUserUsager,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);
  const response = await supertest(app.getHttpServer())
    .post("/portail-usagers/auth/login")
    .send({
      login: authInfo.login,
      password: authInfo.password,
    });
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.token;
  context.user = {
    profile: "usager",
    structureId: authInfo.structureId,
    userUUID: authInfo.uuid,
  };
}
async function authenticateSuperAdmin(
  authInfo: TestUserAdmin,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);
  const response = await supertest(app.getHttpServer())
    .post("/portail-admins/auth/login")
    .send({
      email: authInfo.email,
      password: authInfo.password,
    });
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.token;
  context.user = {
    profile: "super-admin-domifa",
    userUUID: authInfo.uuid,
  };
}

function expectAppToBeDefined(app: INestApplication) {
  if (!app) {
    throw new Error(
      "App is not initialized: call `bootstrapTestApp` with { initApp: true }"
    );
  }
}

function filterSecurityTests(
  testsDefs: AppTestHttpClientSecurityTestDef[]
): AppTestHttpClientSecurityTestDef[] {
  const DOMIFA_FILTER_SEC_TEST = process.env["DOMIFA_FILTER_SEC_TEST"];
  return DOMIFA_FILTER_SEC_TEST?.length > 0
    ? testsDefs.filter((x) => x.label.includes(DOMIFA_FILTER_SEC_TEST))
    : testsDefs;
}
