import { Connection } from "typeorm";
import { appTypeormManager } from "../../database/appTypeormManager.service";
import { cronMailsRepository } from "./cron-mails-repository.service";

describe("cronMailsRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await appTypeormManager.connect();
  });
  afterAll(async () => {
    postgresTypeormConnection.close();
  });

  it("findNextUserToSendCronMail returns next user to send cron mail", async () => {
    // retrieve first user without "guide" mail flag
    const user1 = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate: new Date(Date.now()),
      mailType: "guide",
      structuresIds: [1],
    });
    expect(user1).toBeDefined();

    // mark "guide" mail flag
    await cronMailsRepository.updateMailFlag({
      userId: user1.id,
      mailType: "guide",
      value: true,
    });

    // retrieve next user
    const user2 = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate: new Date(Date.now()),
      mailType: "guide",
      structuresIds: [1],
    });
    expect(user2).toBeDefined();
    // be sure the user is not the same
    expect(user1.id !== user2.id).toBeTruthy();

    // restore user after test (to avoid breaking other tests)
    await cronMailsRepository.updateMailFlag({
      userId: user1.id,
      mailType: "guide",
      value: false,
    });
  });
  it("findNextUserToSendCronMail returns no user", async () => {
    const user = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate: new Date(Date.UTC(2020, 10, 15)),
      mailType: "guide",
      structuresIds: [2],
    });
    expect(user).toBeUndefined();
  });
});
