////////////////// IMPORTANT //////////////////
//
// This file must be imported in:
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "UsagersLienController";
const WRITE_ROLES = ["simple", "responsable", "admin", "agent"] as const;

// These DB dumps don't necessarily contain a usager for every
// structure/context: when `tryGetExistingUsagerForContext` finds nothing,
// we fall back to an arbitrary usagerRef (4444444) and UsagerAccessGuard
// rejects with BAD_REQUEST regardless of role — same behaviour as the
// rest of the usagers module.
export const UsagersLienControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.getLien`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.get(`/usagers-lien/${usagerRef}`, {
            context,
          }),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ALL_USER_STRUCTURE_ROLES,
              validExpectedResponseStatus:
                usager != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.link`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.post(
            `/usagers-lien/${usagerRef}/link`,
            {
              context,
              body: {
                targetUsagerUuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                acceptedSuggestion: false,
              },
            }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: [...WRITE_ROLES],
              // Target doesn't exist either way (usager not found or
              // arbitrary uuid): TARGET_NOT_FOUND / BAD_REQUEST.
              validExpectedResponseStatus: HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.unlink`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.delete(
            `/usagers-lien/${usagerRef}`,
            { context }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: [...WRITE_ROLES],
              // No existing link for this freshly picked dossier.
              validExpectedResponseStatus:
                usager != null ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.getSuggestion`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.get(
            `/usagers-lien/${usagerRef}/suggestion`,
            { context }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: [...WRITE_ROLES],
              validExpectedResponseStatus:
                usager != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.search`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.post(
            `/usagers-lien/${usagerRef}/search`,
            { context, body: { query: "ab" } }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: [...WRITE_ROLES],
              validExpectedResponseStatus:
                usager != null ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.rejectSuggestion`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.post(
            `/usagers-lien/${usagerRef}/reject-suggestion`,
            {
              context,
              body: { ayantDroitUuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
            }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: [...WRITE_ROLES],
              validExpectedResponseStatus:
                usager != null ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
    {
      label: `${CONTROLLER}.getHistory`,
      query: async (context: AppTestContext) => {
        const usager = await AppTestHelper.tryGetExistingUsagerForContext({
          context,
        });
        const usagerRef = usager?.ref ?? 4444444;

        return {
          response: await AppTestHttpClient.get(
            `/usagers-lien/${usagerRef}/history`,
            { context }
          ),
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ALL_USER_STRUCTURE_ROLES,
              validExpectedResponseStatus:
                usager != null ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            }
          ),
        };
      },
    },
  ];
