import { HttpStatus, INestApplication, ModuleMetadata } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { Connection } from "typeorm";
import { appTypeormManager } from "../../database";
import {
  AppTestHttpClientSecurityTestDef,
  TestUserStructure,
  TestUserUsager,
} from "../../_tests";
import { appLogger } from "../AppLogger.service";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
  bootstrapTestConnection,
  tearDownTestConnection,
  authenticateUsager,
  authenticateStructure,
  authenticateSuperAdminDomifa,
  filterSecurityTests,
};

async function bootstrapTestApp(
  metadata: ModuleMetadata,
  initApp: { initApp?: boolean } = { initApp: false }
): Promise<AppTestContext> {
  // re-use shared connection created in jest.setup.ts
  const postgresTypeormConnection = await bootstrapTestConnection();
  const module = await Test.createTestingModule(metadata).compile();
  const context: AppTestContext = { module, postgresTypeormConnection };
  if (initApp) {
    context.app = module.createNestApplication();
    await context.app.init();
  }
  return context;
}

async function tearDownTestApp({
  module,
  postgresTypeormConnection,
}: AppTestContext): Promise<void> {
  await module.close();
  await tearDownTestConnection({ postgresTypeormConnection });
}

async function bootstrapTestConnection(): Promise<Connection> {
  const postgresTypeormConnection = await appTypeormManager.connect({
    reuseConnexion: true,
    overrideConfig: {
      poolMaxConnections: 1,
    },
  });
  return postgresTypeormConnection;
}

async function tearDownTestConnection({
  postgresTypeormConnection,
}: Pick<AppTestContext, "postgresTypeormConnection">): Promise<void> {
  if (postgresTypeormConnection && !process.env.DISABLE_TYPEORM_CLOSE) {
    await postgresTypeormConnection.close();
  } else {
    appLogger.error("Can not close missing postgres connexion");
  }
}

async function authenticateStructure(
  authInfo: TestUserStructure,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);
  const response = await request(app.getHttpServer())
    .post("/structures/auth/login")
    .send(authInfo);
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
  const response = await request(app.getHttpServer())
    .post("/portail-usagers/auth/login")
    .send(authInfo);
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.access_token;
  context.user = {
    profile: "usager",
    structureId: authInfo.structureId,
    userUUID: authInfo.uuid,
  };
}
async function authenticateSuperAdminDomifa(
  authInfo: TestUserStructure,

  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);
  expect(authInfo.structureId).toEqual(1); // hack: super admin is role "admin" + structure 1
  expect(authInfo.role).toEqual("admin");
  const response = await request(app.getHttpServer())
    .post("/structures/auth/login")
    .send(authInfo);
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.access_token;
  context.user = {
    profile: "super-admin-domifa",
    userId: authInfo.id,
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

  const FILTERED_TESTS =
    DOMIFA_FILTER_SEC_TEST?.length > 0
      ? testsDefs.filter((x) => x.label.includes(DOMIFA_FILTER_SEC_TEST))
      : testsDefs;
  return FILTERED_TESTS;
}
