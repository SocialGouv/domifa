import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppTestContext } from "./AppTestContext.type";

export const AppTestHttpClient = {
  get,
  post,
};

function get(
  url: string,
  {
    authenticate = true,
    context,
  }: { authenticate?: boolean; context: AppTestContext }
): request.Test {
  const { app } = context;
  expectAppToBeDefined(app);
  const req = request(app.getHttpServer()).get(url);
  if (authenticate && context.authToken) {
    return req.set("Authorization", `Bearer ${context.authToken}`);
  }
  return req;
}
function post(
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
): request.Test {
  const { app } = context;
  expectAppToBeDefined(app);
  let req = request(app.getHttpServer()).post(url);
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
}

function expectAppToBeDefined(app: INestApplication) {
  if (!app) {
    throw new Error(
      "App is not initialized: call `bootstrapTestApp` with { initApp: true }"
    );
  }
}
