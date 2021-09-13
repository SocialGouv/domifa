import { HttpStatus, INestApplication, ModuleMetadata } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { Connection } from "typeorm";
import { appTypeormManager } from "../../database";
import { appLogger } from "../AppLogger.service";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
  bootstrapTestConnection,
  tearDownTestConnection,
  authenticateStructure,
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
  authInfo,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);
  const response = await request(app.getHttpServer())
    .post("/auth/login")
    .send(authInfo);
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.access_token;
}

function expectAppToBeDefined(app: INestApplication) {
  if (!app) {
    throw new Error(
      "App is not initialized: call `bootstrapTestApp` with { initApp: true }"
    );
  }
}
