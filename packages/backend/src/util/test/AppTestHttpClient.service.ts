import { INestApplication } from "@nestjs/common";
import supertest from "supertest";

import { peekTestOtpCode } from "../../modules/otp/otp-test-sink";
import { AppTestContext } from "./AppTestContext.type";

const OTP_CODE_HEADER = "otp-code";
const OTP_REQUIRED_CODE = "OTP_REQUIRED";

type BaseQueryOptions = {
  authenticate?: boolean;
  context: AppTestContext;
  headers?: { [name: string]: string };
  // Convenience for OTP-protected endpoints — sets the `otp-code` header.
  // Equivalent to `headers: { "otp-code": "<code>" }` but more explicit.
  otpCode?: string;
  // Auto-resolve OTP-protected endpoints. The wrapper runs the request once;
  // if the response is 401 + `{ code: "OTP_REQUIRED" }`, it reads the
  // freshly minted code from the test sink (OtpService writes there when
  // envId="test") and replays the request with the `otp-code` header set.
  // Requires `context.user.userUUID` (i.e. an authenticated test context).
  withOtp?: boolean;
};

type WriteQueryOptions = BaseQueryOptions & {
  body?: string | object;
  fields?: { [name: string]: string };
  attachments?: { [name: string]: string };
};

export const AppTestHttpClient = {
  get,
  delete: query("delete"),
  put: query("put"),
  post: query("post"),
  patch: query("patch"),
};

function get(
  url: string,
  options: BaseQueryOptions
): Promise<supertest.Response> | supertest.Test {
  const build = (overrides: Partial<BaseQueryOptions> = {}) =>
    buildGetRequest(url, { ...options, ...overrides });

  if (options.withOtp) {
    return runWithOtp(build, options);
  }
  return build();
}

function query(method: "post" | "put" | "patch" | "delete") {
  return function (
    url: string,
    options: WriteQueryOptions
  ): Promise<supertest.Response> | supertest.Test {
    const build = (overrides: Partial<WriteQueryOptions> = {}) =>
      buildWriteRequest(method, url, { ...options, ...overrides });

    if (options.withOtp) {
      return runWithOtp(build, options);
    }
    return build();
  };
}

function buildGetRequest(
  url: string,
  options: BaseQueryOptions
): supertest.Test {
  const { app } = options.context;
  expectAppToBeDefined(app);

  let req = supertest(app.getHttpServer()).get(url);
  req = applyHeaders(req, options);
  return applyAuth(req, options);
}

function buildWriteRequest(
  method: "post" | "put" | "patch" | "delete",
  url: string,
  options: WriteQueryOptions
): supertest.Test {
  const { app } = options.context;
  expectAppToBeDefined(app);

  const client = supertest(app.getHttpServer());
  let req =
    method === "post"
      ? client.post(url)
      : method === "put"
      ? client.put(url)
      : method === "patch"
      ? client.patch(url)
      : client.delete(url);

  if (options.body) {
    req = req.send(options.body);
  }
  req = applyHeaders(req, options);
  if (options.fields) {
    Object.keys(options.fields).forEach((key) => {
      req = req.field(key, options.fields![key]);
    });
  }
  if (options.attachments) {
    Object.keys(options.attachments).forEach((key) => {
      req = req.attach(key, options.attachments![key]);
    });
  }

  return applyAuth(req, options);
}

async function runWithOtp(
  build: (overrides?: Partial<BaseQueryOptions>) => supertest.Test,
  options: BaseQueryOptions
): Promise<supertest.Response> {
  const userUuid = options.context.user?.userUUID;
  if (!userUuid) {
    throw new Error(
      "[AppTestHttpClient] withOtp requires an authenticated context with user.userUUID"
    );
  }

  const first = await build();
  if (!isOtpRequired(first)) {
    return first;
  }

  // The OTP row + the test-sink entry are both written synchronously inside
  // the request handler (OtpService.doGenerateOrResend → recordTestOtpCode →
  // sendOtpEmail) before the 401 is returned, so the code is already
  // available — no need to poll.
  const code = peekTestOtpCode(userUuid);
  if (!code) {
    throw new Error(
      `[AppTestHttpClient] OTP_REQUIRED returned but no code was captured for user ${userUuid}. Is envId="test"?`
    );
  }

  return build({ otpCode: code });
}

function isOtpRequired(res: supertest.Response): boolean {
  return res.status === 401 && res.body?.code === OTP_REQUIRED_CODE;
}

function applyHeaders(
  req: supertest.Test,
  { headers, otpCode }: BaseQueryOptions
): supertest.Test {
  if (headers) {
    Object.keys(headers).forEach((key) => {
      req = req.set(key, headers[key]);
    });
  }
  if (otpCode !== undefined) {
    req = req.set(OTP_CODE_HEADER, otpCode);
  }
  return req;
}

function applyAuth(
  req: supertest.Test,
  { authenticate = true, context }: BaseQueryOptions
): supertest.Test {
  if (authenticate && context.authToken) {
    return req.set("Authorization", `Bearer ${context.authToken}`);
  }
  return req;
}

function expectAppToBeDefined(app: INestApplication) {
  if (!app) {
    throw new Error(
      "App is not initialized: call `bootstrapTestApp` with { initApp: true }"
    );
  }
}
