import { ModuleMetadata } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Connection } from "typeorm";
import { appTypeormManager } from "../../database";
import { appLogger } from "../AppLogger.service";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
  bootstrapTestConnection,
  tearDownTestConnection,
};

async function bootstrapTestApp(
  metadata: ModuleMetadata
): Promise<AppTestContext> {
  // re-use shared connection created in jest.setup.ts
  const postgresTypeormConnection = await bootstrapTestConnection();
  const module = await Test.createTestingModule(metadata).compile();
  return { module, postgresTypeormConnection };
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
