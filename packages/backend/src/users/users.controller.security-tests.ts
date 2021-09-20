////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { AppTestContext, AppTestHttpClient } from "../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../_tests";

const CONTROLLER = "UserController";

export const UserControllerSecurityTests: AppTestHttpClientSecurityTestDef[] = [
  {
    label: `${CONTROLLER}.getUsers`,
    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.get("/users", {
        context,
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["responsable", "admin"],
        }
      ),
    }),
  },
  {
    label: `${CONTROLLER}.getUsersToConfirm`,
    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.get("/users/to-confirm", {
        context,
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["admin"],
        }
      ),
    }),
  },
  {
    label: `${CONTROLLER}.confirmUserFromAdmin`,

    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.patch("/users/confirm/1", {
        context,
        body: {},
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["admin"],
        }
      ),
    }),
  },
  {
    label: `${CONTROLLER}.updateRole`,
    query: async (context: AppTestContext) => ({
      response: await AppTestHttpClient.patch("/users/update-role/13", {
        context,
        body: {
          role: "simple",
        },
      }),
      expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
        context.user,
        {
          roles: ["admin"],
        }
      ),
    }),
  },
];
