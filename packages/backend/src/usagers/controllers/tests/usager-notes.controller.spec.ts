import { UsersModule } from "../../../users/users.module";
import {
  AppTestContext,
  AppTestHelper,
  AppTestHttpClient,
} from "../../../util/test";
import { UsagerNote } from "../../../_common/model";
import { TESTS_USERS_STRUCTURE } from "../../../_tests";
import { UsagerNotesController } from "../usager-notes.controller";

describe("UsagerNote Controller", () => {
  let context: AppTestContext;

  let usagerNotForTest: UsagerNote;
  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [UsagerNotesController],
        imports: [UsersModule],
      },
      { initApp: true }
    );

    const authInfo = TESTS_USERS_STRUCTURE.BY_EMAIL["s1-admin@yopmail.com"];
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
    expect(response.body.notes[0].archived).toEqual(false);
    expect(response.body.notes[0].message).toEqual("Test message");
    expect(response.status).toEqual(201);

    usagerNotForTest = response.body.notes[0];
  });

  it("Should return bad request", async () => {
    const response = await AppTestHttpClient.post("/usagers-notes/3", {
      context,
      body: {
        message: "1",
      },
    });
    expect(response.status).toEqual(400);
  });

  it("Should archive created note", async () => {
    const response = await AppTestHttpClient.put(
      "/usagers-notes/3/archive/" + usagerNotForTest.uuid,
      {
        context,
      }
    );

    expect(response.body.ref).toEqual(3);
    expect(response.body.notes[0].archived).toEqual(true);
    expect(response.body.notes[0].message).toEqual("Test message");
    expect(response.status).toEqual(200);
  });
});
