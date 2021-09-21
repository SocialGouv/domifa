import { HttpStatus } from "@nestjs/common";
import { AppTestContext } from "../../util/test";
import supertest = require("supertest");

export type AppTestHttpClientSecurityTestDef = {
  label: string;
  query: (context: AppTestContext) => Promise<{
    response: supertest.Response;
    expectedStatus: HttpStatus;
  }>;
};
