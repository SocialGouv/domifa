////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "UsagerDocsController";

jest.mock("node-pdftk", () => ({
  input: () => ({
    fillForm: () => ({ output: () => Promise.resolve(Buffer.from("pdf")) }),
  }),
}));

export const UsagerDocsControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getCerfa - without decisionUuid`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });

        // Some DB dumps may not contain usagers for every structure.
        // In that case, this endpoint should be rejected by the usager access guard.
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.get(
            `/docs/cerfa/${usagerRef}/attestation`,
            {
              context,
            }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin", "agent"],
              validExpectedResponseStatus:
                usager != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.getCerfa - with valid decisionUuid`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });

        const usagerRef = usager?.ref ?? 4444444;
        const decisionUuid = usager?.decision?.uuid;

        // If there is no usager or no decisionUuid in the dump, we expect a 4xx.
        const validExpectedResponseStatus =
          usager && decisionUuid ? HttpStatus.OK : HttpStatus.BAD_REQUEST;

        return {
          response: await AppTestHttpClient.get(
            `/docs/cerfa/${usagerRef}/attestation?decisionUuid=${
              decisionUuid ?? "missing"
            }`,
            {
              context,
            }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin", "agent"],
              validExpectedResponseStatus,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.getCerfa - with invalid UUID format`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/docs/cerfa/1/attestation?decisionUuid=invalid-uuid",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin", "agent"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.getCerfa - with non-existing decisionUuid`,
      query: async (context: AppTestContext) => ({
        response: await AppTestHttpClient.get(
          "/docs/cerfa/1/attestation?decisionUuid=f47ac10b-58cc-4372-a567-0e02b2c3d479",
          {
            context,
          }
        ),
        expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["simple", "responsable", "admin", "agent"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
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
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
          }
        ),
      }),
    },
    {
      label: `${CONTROLLER}.getUsagerDocuments`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });

        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.get(`/docs/${usagerRef}`, {
            context,
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin"],
              validExpectedResponseStatus:
                usager != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
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
            roles: ["simple", "responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            invalidStructureIdExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            validStructureIds: [1],
          }
        ),
      }),
    },
  ];
