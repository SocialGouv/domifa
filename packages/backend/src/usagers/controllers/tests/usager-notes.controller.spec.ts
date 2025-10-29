import { UsersModule } from "../../../modules/users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";

import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { UsagerNotesController } from "../usager-notes.controller";
import { UsagerNote } from "@domifa/common";

describe("UsagerNote Controller", () => {
  let context: AppTestContext;

  let usagerNoteForTest: UsagerNote;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [UsagerNotesController],
        imports: [UsersModule],
      },
      { initApp: true }
    );

    const authInfo =
      TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];

    await AppTestHelper.authenticateStructure(authInfo, { context });
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("Should create one note", async () => {
    const response = await AppTestHttpClient.post("/usagers-notes/3", {
      context,
      body: {
        message: "Test message <br>",
      },
    });
    expect(response.body.ref).toEqual(3);
    expect(response.status).toEqual(201);
  });

  it("Should return bad request", async () => {
    const response = await AppTestHttpClient.post("/usagers-notes/3", {
      context,
      body: {
        message: "",
      },
    });
    expect(response.status).toEqual(400);
  });

  it("Should get the last note", async () => {
    const response = await AppTestHttpClient.post(
      "/usagers-notes/search/3/false",
      {
        context,
        body: { order: "DESC", page: 1, take: 1 },
      }
    );

    expect(response.status).toEqual(201);
    expect(response.body.data.length).toEqual(1);
    usagerNoteForTest = response.body.data[0];
    expect(usagerNoteForTest.message).toEqual("Test message");
  });

  it("Should archive created note", async () => {
    const response = await AppTestHttpClient.put(
      "/usagers-notes/3/archive/" + usagerNoteForTest.uuid,
      {
        context,
      }
    );

    const responseCheck = await AppTestHttpClient.post(
      "/usagers-notes/search/3/true",
      {
        context,
        body: { order: "DESC", page: 1, take: 1 },
      }
    );

    expect(responseCheck.body.data[0].archived).toEqual(true);
    expect(response.body.ref).toEqual(3);
    expect(response.status).toEqual(200);
  });

  // must withdraw the note from the archives
  it("Should withdraw the note from the archives", async () => {
    const response = await AppTestHttpClient.put(
      "/usagers-notes/3/archive/" + usagerNoteForTest.uuid,
      {
        context,
      }
    );

    const responseCheck = await AppTestHttpClient.post(
      "/usagers-notes/search/3/true",
      {
        context,
        body: { order: "DESC", page: 1, take: 1 },
      }
    );

    expect(responseCheck.body.data[0].archived).toEqual(false);
    expect(response.body.ref).toEqual(3);
    expect(response.status).toEqual(200);
  });
  it("Should pin the note in usager profil", async () => {
    const response = await AppTestHttpClient.put(
      "/usagers-notes/3/pin/" + usagerNoteForTest.uuid,
      {
        context,
      }
    );

    expect(response.body.ref).toEqual(3);
    expect(response.body.pinnedNote.message).toEqual("Test message");
    expect(response.status).toEqual(200);
  });
});
