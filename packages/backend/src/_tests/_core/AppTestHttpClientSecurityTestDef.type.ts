import { HttpStatus } from "@nestjs/common";
import supertest from "supertest";
import { AppTestContext } from "../../util/test";

export type AppTestHttpClientSecurityTestDef = {
  label: string;
  query: (context: AppTestContext) => Promise<{
    response: supertest.Response;
    expectedStatus: HttpStatus;
  }>;
};
