import { ModuleMetadata } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Connection } from "typeorm";
import { appTypeormManager } from "../../database";
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
  });
  return postgresTypeormConnection;
}

async function tearDownTestConnection({
  postgresTypeormConnection,
}: Pick<AppTestContext, "postgresTypeormConnection">): Promise<void> {
  postgresTypeormConnection.close();
}
