import { ModuleMetadata } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { appTypeormManager } from "../../database/appTypeormManager.service";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
};

async function bootstrapTestApp(
  metadata: ModuleMetadata
): Promise<AppTestContext> {
  const postgresTypeormConnection = await appTypeormManager.connect();
  const module = await Test.createTestingModule(metadata).compile();
  return { module, postgresTypeormConnection };
}

async function tearDownTestApp({
  module,
  postgresTypeormConnection,
}: AppTestContext): Promise<void> {
  await module.close();
  await postgresTypeormConnection.close();
}
