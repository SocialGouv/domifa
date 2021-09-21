////////////////// IMPORTANT //////////////////
//
// Ce fichier doit être importé dans :
// - API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
//

import { HttpStatus } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { AppTestContext, AppTestHttpClient } from "../../../util/test";
import {
  AppTestHttpClientSecurityTestDef,
  expectedResponseStatusBuilder,
} from "../../../_tests";

const CONTROLLER = "ImportController";

const importFilesDir = path.resolve(
  __dirname,
  "../../../_static/usagers-import-test"
);

export const ImportControllerSecurityTests: AppTestHttpClientSecurityTestDef[] =
  [
    {
      label: `${CONTROLLER}.importExcel (fichier incorrect)`,
      query: async (context: AppTestContext) => {
        const importFilePath = path.resolve(importFilesDir, "import_ko_1.xlsx");

        expect(fs.existsSync(importFilePath)).toBeTruthy();

        const headers: { [name: string]: string } = {};
        headers["Content-Type"] = "multipart/form-data";

        const response = await AppTestHttpClient.post("/import/confirm", {
          headers,
          attachments: { file: importFilePath },
          context,
        });

        return {
          response,
          expectedStatus: expectedResponseStatusBuilder.allowStructureOnly(
            context.user,
            {
              roles: ["simple", "responsable", "admin"],
              validExpectedResponseStatus: HttpStatus.BAD_REQUEST, // this is an invalid xls file
            }
          ),
        };
      },
    },
  ];
