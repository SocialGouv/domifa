import { AppTestHelper } from "../../../../util/test";
import { usagerLightRepository } from "../usagerLightRepository.service";

describe("usagerLightRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("findNextMeetings", async () => {
    const rendezVous = await usagerLightRepository.findNextMeetings({
      userId: 2,
      dateRefNow: new Date(Date.UTC(2019, 1, 1)),
    });
    expect(rendezVous.length).toEqual(1);
  });
});
