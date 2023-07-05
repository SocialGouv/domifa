import { pathExists } from "fs-extra";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { AppLogsService } from "../../../modules/app-logs/app-logs.service";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsagerDocsController } from "../usager-docs.controller";
import { resolve } from "path";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { UsagerDoc } from "../../../_common/model";
import { HttpStatus } from "@nestjs/common";

describe("Document Controller", () => {
  let controller: UsagerDocsController;

  let context: AppTestContext;
  let doc: UsagerDoc;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [UsagerDocsController],
      imports: [UsersModule, InteractionsModule, StructuresModule],
      providers: [AppLogsService],
    });
    controller = context.module.get<UsagerDocsController>(UsagerDocsController);

    const authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-admin@yopmail.com"];

    await AppTestHelper.authenticateStructure(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it(`✅ Ajout d'un fichier`, async () => {
    const importFilePath = resolve(
      __dirname,
      "../../../_static/usager-docs-test/logo-beta.jpeg"
    );

    expect(await pathExists(importFilePath)).toBeTruthy();

    const headers: { [name: string]: string } = {};
    headers["Content-Type"] = "multipart/form-data";

    const response = await AppTestHttpClient.post("/docs/1", {
      headers,
      attachments: { file: importFilePath },
      fields: {
        label: "Logo beta-gouv",
      },
      context,
    });

    expect(response.status).toBe(HttpStatus.OK);

    expect(response.body.length).toEqual(2);
    expect(response.body[1].createdBy).toEqual("Patrick Roméro");
    expect(response.body[1].filetype).toEqual("image/jpeg");
    expect(response.body[1].label).toEqual("Logo beta-gouv");

    doc = response.body[1];
  });
  it(`✅ Suppression d'un fichier`, async () => {
    const response = await AppTestHttpClient.delete(`/docs/1/${doc.uuid}`, {
      context,
    });

    expect(response.status).toBe(HttpStatus.OK);
  });
});
