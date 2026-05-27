import { myDataSource } from "../../database/services/_postgres/appTypeormManager.service";
import {
  appLogSecurityRepository,
  otpRepository,
  userUsagerRepository,
} from "../../database";
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
import { OTP_CODE_HEADER } from "../../modules/otp/otp.constants";
import { peekTestOtpCode } from "../../modules/otp/otp-test-sink";

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
  // Defer the destroy to the next tick so the pool stays alive long enough
  // for the next suite's bootstrap to grab a connection. Required when all
  // suites share a single process (CI: --runInBand) and module-level
  // repositories (e.g. otpRepository, usagerRepository) hold a reference
  // to the pool: a synchronous destroy() between suites would otherwise
  // surface as `Cannot use a pool after calling end on the pool` on the
  // next query. `--forceExit` cleans up at the very end.
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

  // Make sure leftover security events from a previous Jest run (FAILED_AUTH
  // counter) can't trip the lockout on this test user.
  await clearSecurityEventsForUser({
    column: "userStructureId",
    userId: authInfo.id,
  });

  const response = await supertest(app.getHttpServer())
    .post("/structures/auth/login")
    .send({
      email: authInfo.email,
      password: authInfo.password,
    });

  if (response.status !== HttpStatus.OK) {
    // eslint-disable-next-line no-console
    console.error(
      "[authenticateStructure] unexpected response:",
      response.body
    );
  }
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

  // Clear leftover security events so the per-user lockout counter starts
  // from zero. Usager fixtures are keyed by uuid, look up the numeric id.
  const usager = await userUsagerRepository.findOne({
    where: { uuid: authInfo.uuid },
    select: { id: true },
  });
  if (usager) {
    await appLogSecurityRepository.delete({ userUsagerId: usager.id });
  }

  const response = await supertest(app.getHttpServer())
    .post("/portail-usagers/auth/login")
    .send({
      login: authInfo.login,
      password: authInfo.password,
    });
  if (response.status !== HttpStatus.OK) {
    // eslint-disable-next-line no-console
    console.error("[authenticateUsager] unexpected response:", response.body);
  }
  expect(response.status).toBe(HttpStatus.OK);
  context.authToken = response.body.token;
  context.user = {
    profile: "usager",
    structureId: authInfo.structureId,
    userUUID: authInfo.uuid,
  };
}

// Wipes the security audit rows that would otherwise count toward the
// lockout backoff on this user. Called from every test-helper login so a
// freshly bootstrapped suite never inherits failures from previous runs.
async function clearSecurityEventsForUser({
  column,
  userId,
}: {
  column: "userStructureId" | "userSupervisorId" | "userUsagerId";
  userId: number;
}): Promise<void> {
  await appLogSecurityRepository.delete({ [column]: userId });
}

async function authenticateSupervisor(
  authInfo: TestUserAdmin,
  { context }: { context: AppTestContext }
) {
  const { app } = context;
  expectAppToBeDefined(app);

  // Supervisor login is OTP-gated: the first call mints the code and returns
  // 401 OTP_REQUIRED, then we replay with the captured code from the test
  // sink to obtain the JWT. A leftover active OTP from a previous suite would
  // be silently reused by OtpService — bypassing recordTestOtpCode — so we
  // wipe any prior OTP for this user before priming.
  await otpRepository.delete({ userUuid: authInfo.uuid });

  const primer = await supertest(app.getHttpServer())
    .post("/portail-admins/auth/login")
    .send({
      email: authInfo.email,
      password: authInfo.password,
    });
  expect(primer.status).toBe(HttpStatus.UNAUTHORIZED);
  expect(primer.body).toEqual({ code: "OTP_REQUIRED" });

  const otpCode = peekTestOtpCode(authInfo.uuid);
  if (!otpCode) {
    throw new Error(
      `[tests] No OTP captured for supervisor uuid=${authInfo.uuid} after login primer`
    );
  }

  const response = await supertest(app.getHttpServer())
    .post("/portail-admins/auth/login")
    .set(OTP_CODE_HEADER, otpCode)
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
