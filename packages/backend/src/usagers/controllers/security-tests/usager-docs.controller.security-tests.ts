////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "UsagerDocsController";

export const UsagerDocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getDocument`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/docs/1/c669f08b-74a8-4ffc-8128-c9e29e2fd535",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // filesystem document does not exists in tests
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.getUsagerDocuments`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get("/docs/1", {
          context,
        }),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validStructureIds: [1],
            validExpectedResponseStatus: HttpStatus.OK, // filesystem document does not exists in tests
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.patchDocument (wrong payload)`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.patch(
          "/docs/7/542a0da1-ea1c-48ab-8026-67a4248b1c47",
          {
            context,
            body: {
              label: "x",
              shared: "donnée non valable",
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            allowSuperAdminDomifa: false,
            validStructureIds: [1],
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.patchDocument (Good payload)`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.patch(
          "/docs/7/542a0da1-ea1c-48ab-8026-67a4248b1c47",
          {
            context,
            body: {
              label: "Nouveau label",
              shared: true,
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.OK,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            allowSuperAdminDomifa: false,
            validStructureIds: [1],
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.patchDocument (wrong id)`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.patch(
          "/docs/xxxxxxx/542a0da1-ea1c-48ab-8026-67a4248b1c47",
          {
            context,
            body: {
              label: "xxxx",
              shared: "xxxxx",
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            allowSuperAdminDomifa: false,
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            validStructureIds: [1],
          }
        ),
      }),
    },
  ];
