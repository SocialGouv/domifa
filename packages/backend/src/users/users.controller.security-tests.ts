////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { AppTestContext, AppTestHttpClient } from "../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
  securityTestDataBuilder,
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

    query: async (context: AppTestContext) => {
      const otherUserSameStructure =
        securityTestDataBuilder.getOtherUserSameStructure(context);
      return {
        response: await AppTestHttpClient.patch(
          `/users/confirm/${otherUserSameStructure?.id ?? 5}`,
          {
            context,
            body: {},
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
          }
        ),
      };
    },
  },
  {
    label: `${CONTROLLER}.updateRole`,
    query: async (context: AppTestContext) => {
      const otherUserSameStructure =
        securityTestDataBuilder.getOtherUserSameStructure(context);

      return {
        response: await AppTestHttpClient.patch(
          `/users/update-role/${otherUserSameStructure?.id ?? 5}`,
          {
            context,
            body: {
              role: otherUserSameStructure?.role ?? "simple", // don't change the role, or it breaks the later tests!
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
          }
        ),
      };
    },
  },
  {
    label: `${CONTROLLER}.updateRole (mauvaise structure)`,
    query: async (context: AppTestContext) => {
      const userOtherStructure =
        securityTestDataBuilder.getUserOtherStructure(context);

      return {
        response: await AppTestHttpClient.patch(
          `/users/update-role/${userOtherStructure?.id ?? 5}`,
          {
            context,
            body: {
              role: "simple",
            },
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["admin"],
            validExpectedResponseStatus: HttpStatus.FORBIDDEN, // ce user appartient à une autre structure!
          }
        ),
      };
    },
  },
];
