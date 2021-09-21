import { INestApplication } from "@nestjs/common";
import * as supertest from "supertest";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHttpClient = {
  get,
  delete: query("delete"),
  put: query("put"),
  post: query("post"),
  patch: query("patch"),
};

function get(
  url: string,
  {
    authenticate = true,
    context,
  }: { authenticate?: boolean; context: AppTestContext }
): supertest.Test {
  const { app } = context;
  expectAppToBeDefined(app);
  const req = supertest(app.getHttpServer()).get(url);
  if (authenticate && context.authToken) {
    return req.set("Authorization", `Bearer ${context.authToken}`);
  }
  return req;
}
function query(method: "post" | "put" | "patch" | "delete") {
  return function (
    url: string,
    {
      authenticate = true,
      body,
      headers,
      context,
      attachments,
    }: {
      authenticate?: boolean;
      body?: string | object;
      headers?: { [name: string]: string };
      context: AppTestContext;
      attachments?: { [name: string]: string };
    }
  ): supertest.Test {
    const { app } = context;
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
    if (body) {
      req = req.send(body);
    }
    if (headers) {
      Object.keys(headers).forEach((key) => {
        req = req.set(key, headers[key]);
      });
    }
    if (attachments) {
      Object.keys(attachments).forEach((key) => {
        req = req.attach(key, attachments[key]);
      });
    }

    if (authenticate && context.authToken) {
      return req.set("Authorization", `Bearer ${context.authToken}`);
    }
    return req;
  };
}

function expectAppToBeDefined(app: INestApplication) {
  if (!app) {
    throw new Error(
      "App is not initialized: call `bootstrapTestApp` with { initApp: true }"
    );
  }
}
