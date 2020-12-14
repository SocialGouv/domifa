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

  it("findNextUserToSendCronMail returns next user to send cron mail", async () => {
    let INITIAL_MATCHING_USERS_COUNT: number;

    let user1: Pick<AppUser, "id" | "email" | "nom" | "prenom">;
    {
      // retrieve users without "guide" mail flag
      const users = await cronMailsRepository.findUsersToSendCronMail({
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
      maxCreationDate: new Date(Date.UTC(2020, 10, 15)),
      mailType: "guide",
      structuresIds: [2],
    });
    expect(users.length).toEqual(0);
  });
});
