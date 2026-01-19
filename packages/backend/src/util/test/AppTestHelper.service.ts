import { myDataSource } from "../../database/services/_postgres/appTypeormManager.service";
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
import { UsagerTable } from "../../database";
import {
  AppTestHttpClientSecurityTestDef,
  TestUserAdmin,
  TestUserStructure,
  TestUserUsager,
} from "../../_tests";

import { AppTestContext } from "./AppTestContext.type";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";

export const AppTestHelper = {
  bootstrapTestApp,
  tearDownTestApp,
  bootstrapTestConnection,
  tearDownTestConnection,
  authenticateUsager,
  authenticateStructure,
  authenticateSupervisor,
  getExistingUsagerForContext,
  tryGetExistingUsagerForContext,
  filterSecurityTests,
};

const s3Mock = mockClient(S3Client);
s3Mock.on(GetObjectCommand).resolves({
  $metadata: {
    httpStatusCode: 200,
    requestId: "17B912C761BC159D",
    extendedRequestId:
      "dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8",
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
  ETag: '"691e6a288391886cff90055410335b82"',
});
s3Mock.on(ListObjectsV2Command).resolves({
  Contents: [
    {
      Key: "files/6583c2671c304cc692368da8f3ed1154/84c10b8d481440f8aeb6e8e287ea54a5/46bbca5777439ef2c46571dcb9390fa7.pdf.sfe",
      LastModified: new Date("2024-03-02T22:20:15.935Z"),
      ETag: '"b79bfad228eace536fdad1713e6a34e5"',
      Size: 738202,
      StorageClass: "STANDARD",
    },
    {
      Key: "domifa/usager-documents/6583c2671c304cc692368da8f3ed1154/84c10b8d481440f8aeb6e8e287ea54a5/bf66213430388f487bb4acb7eacdfd9c.pdf.sfe",
      LastModified: new Date("2024-03-02T22:20:11.092Z"),
      ETag: '"1e6b3acf7a33d0885faa1fd8d46bdd44"',
      Size: 65720,
      StorageClass: "STANDARD",
    },
  ],
  IsTruncated: false,
  KeyCount: 2,
  MaxKeys: 1000,
  Name: "domifa",
  Prefix:
    "files/6583c2671c304cc692368da8f3ed1154/84c10b8d481440f8aeb6e8e287ea54a5/",
});

s3Mock.on(DeleteObjectsCommand).resolves({ Deleted: [] });

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
        stopAtFirstError: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      })
    );
    await context.app.init();
  }
  return context;
}
async function tearDownTestConnection(): Promise<void> {
  // In tests we want deterministic teardown: leaving the pg pool open
  // makes Jest report open handles (TCPWRAP) and can also lead to flaky
  // behavior when running many suites.
  await myDataSource.destroy();
}

async function tearDownTestApp({ module }: AppTestContext): Promise<void> {
  await module.close();
  await myDataSource.destroy();
}

async function bootstrapTestConnection(): Promise<DataSource> {
  return await appTypeormManager.connect({
    reuseConnexion: true,
  });
}

/**
 * Returns an usager that exists in DB and is compatible with the current test context.
 *
 * Why this exists:
 * - Many security tests were hardcoding `usagerRef=1`.
 * - Some other test suites create new usagers/interactions and mutate the shared DB.
 * - With a shared connection (reuseConnexion=true), the DB state becomes order-dependent,
 *   making the security tests flaky.
 *
 * Strategy:
 * - If the context is authenticated as a structure user, pick an usager belonging to that structure.
 * - Otherwise (anonymous/supervisor), pick any existing usager from the dump.
 */
async function getExistingUsagerForContext({
  context,
}: {
  context: AppTestContext;
}): Promise<
  Pick<UsagerTable, "ref" | "structureId" | "decision" | "historique">
> {
  await bootstrapTestConnection();

  const structureId =
    context.user?.profile === "structure"
      ? context.user.structureId
      : undefined;

  const repo = myDataSource.getRepository(UsagerTable);

  // TypeORM v0.3+: `findOne` requires a `where` clause.
  // For non-structure contexts (anonymous/supervisor), pick any existing usager.
  const usager = structureId
    ? await repo.findOne({
        where: { structureId } as any,
        order: { ref: "ASC" } as any,
        // NOTE: `decision` / `historique` are jsonb columns; simplest is to select all.
      })
    : (
        await repo.find({
          take: 1,
          order: { structureId: "ASC", ref: "ASC" } as any,
          // NOTE: `decision` / `historique` are jsonb columns; simplest is to select all.
        })
      )[0];

  if (!usager) {
    throw new Error(
      `[tests] No usager found in test database${
        structureId ? ` for structureId=${structureId}` : ""
      }. The DB dump may be missing expected fixtures.`
    );
  }

  return usager;
}

/**
 * Same as [`getExistingUsagerForContext()`](packages/backend/src/util/test/AppTestHelper.service.ts:141) but returns `null`
 * instead of throwing if the DB dump doesn't contain any matching usager.
 *
 * This is useful for security tests: some test DB dumps may not contain usagers
 * for every structure (ex: structureId=3), and the expected status should then
 * be a 4xx (bad request) rather than failing the test suite with a thrown error.
 */
async function tryGetExistingUsagerForContext({
  context,
}: {
  context: AppTestContext;
}): Promise<Pick<
  UsagerTable,
  "ref" | "structureId" | "decision" | "historique"
> | null> {
  try {
    return await getExistingUsagerForContext({ context });
  } catch {
    return null;
  }
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

async function authenticateSupervisor(
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
    profile: "supervisor",
    userUUID: authInfo.uuid,
    userId: authInfo.id,
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
