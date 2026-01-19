////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import { pathExists } from "fs-extra";
import { resolve } from "path";

import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "ImportController";

const importFilesDir = resolve(
  __dirname,
  "../../../_static/usagers-import-test"
);

export const ImportControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.importExcel (fichier incorrect)`,
      query: async (context: AppTestContext) => {
        const expectedStatus = expectedResponseStatusBuilder.allowStructureOnly(
          context.user,
          {
            roles: ["responsable", "admin"],
            validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // invalid xls file
          }
        );

        // For forbidden/unauthorized users, sending a multipart stream may
        // trigger "write EPIPE" because guards can reject the request early
        // without consuming the body.
        // Only send the file when the user is authorized to hit the endpoint.
        let response;
        if (expectedStatus === HttpStatus.BAD_REQUEST) {
          const importFilePath = resolve(importFilesDir, "import_ko_1.xlsx");
          expect(await pathExists(importFilePath)).toBeTruthy();

          const headers: { [name: string]: string } = {
            "Content-Type": "multipart/form-data",
          };

          response = await AppTestHttpClient.post("/import/confirm", {
            headers,
            attachments: { file: importFilePath },
            context,
          });
        } else {
          response = await AppTestHttpClient.post("/import/confirm", {
            context,
          });
        }

        return {
          response,
          expectedStatus,
        };
      },
    },
  ];
