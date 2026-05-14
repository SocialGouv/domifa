import { INestApplication } from "@nestjs/common";
import supertest from "supertest";

import { AppTestContext } from "./AppTestContext.type";

const OTP_CODE_HEADER = "x-otp-code";

type BaseQueryOptions = {
  authenticate?: boolean;
  context: AppTestContext;
  headers?: { [name: string]: string };
  // Convenience for OTP-protected endpoints — sets the `x-otp-code` header.
  // Equivalent to `headers: { "x-otp-code": "<code>" }` but more explicit.
  otpCode?: string;
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

function get(url: string, options: BaseQueryOptions): supertest.Test {
  const { app } = options.context;
  expectAppToBeDefined(app);

  let req = supertest(app.getHttpServer()).get(url);
  req = applyHeaders(req, options);
  return applyAuth(req, options);
}

function query(method: "post" | "put" | "patch" | "delete") {
  return function (url: string, options: WriteQueryOptions): supertest.Test {
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
  };
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
