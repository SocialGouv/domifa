import { Connection } from "typeorm";
import { AppTestHelper } from "../../../util/test";
import { AppUser } from "../../../_common/model";
import { cronMailsRepository } from "./cron-mails-repository.service";

describe("cronMailsRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findNextUserToSendCronMail returns next user to send guide mail", async () => {
    let INITIAL_MATCHING_USERS_COUNT: number;

    let user1: Pick<AppUser, "id" | "email" | "nom" | "prenom">;
    {
      // retrieve users without "guide" mail flag
      const users = await cronMailsRepository.findUsersToSendCronMail({
        minCreationDate: new Date(Date.UTC(2020, 11, 1)),
        maxCreationDate: new Date(Date.now()),
        mailType: "guide",
        structuresIds: [1, 2],
      });
      expect(users.length).toBeGreaterThan(1);
      INITIAL_MATCHING_USERS_COUNT = users.length;

      user1 = users[0];

      // mark "guide" mail flag
      await cronMailsRepository.updateMailFlag({
        userId: user1.id,
        mailType: "guide",
        value: true,
      });
    }

    {
      // retrieve users again
      const users = await cronMailsRepository.findUsersToSendCronMail({
        minCreationDate: new Date(Date.UTC(2020, 11, 1)),
        maxCreationDate: new Date(Date.now()),
        mailType: "guide",
        structuresIds: [1],
      });
      expect(users.length).toEqual(INITIAL_MATCHING_USERS_COUNT - 1);
    }

    // restore user after test (to avoid breaking other tests)
    await cronMailsRepository.updateMailFlag({
      userId: user1.id,
      mailType: "guide",
      value: false,
    });
  });
  it("findNextUserToSendCronMail returns no user", async () => {
    const users = await cronMailsRepository.findUsersToSendCronMail({
      minCreationDate: new Date(Date.UTC(2019, 11, 1)),
      maxCreationDate: new Date(Date.UTC(2020, 10, 15)),
      mailType: "guide",
      structuresIds: [2],
    });
    expect(users.length).toEqual(0);
  });

  it("findNextUserToSendCronMail returns next user to send import mail", async () => {
    // retrieve users without "guide" mail flag
    const users = await cronMailsRepository.findUsersToSendCronMail({
      minCreationDate: new Date(Date.UTC(2020, 11, 1)),
      maxCreationDate: new Date(Date.now()),
      mailType: "import",
    });
    expect(users.length).toBeGreaterThanOrEqual(5);
    users.forEach((user) => {
      expect(user.role === "facteur").toBeFalsy;
    });
  });
});
