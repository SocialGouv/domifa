import {
  structureRepository,
  userStructureRepository,
} from "../../../../database";
import {
  AppTestContext,
  AppTestHelper,
  JEST_FAKE_TIMER,
} from "../../../../util/test";

import { UserStructureAuthenticated } from "../../../../_common/model";
import { generateDateForCerfa } from "../generateDateForCerfa.service";

describe("generateDateForCerfa", () => {
  let context: AppTestContext;
  let user: UserStructureAuthenticated;

  afterAll(async () => {
    jest.useRealTimers();
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({});

    //Date de référence : 22 Mars 2023
    jest
      .useFakeTimers(JEST_FAKE_TIMER)
      .setSystemTime(new Date("2023-03-22T20:45:47.433Z"));

    user = (await userStructureRepository.findOneBy({
      id: 11,
    })) as unknown as UserStructureAuthenticated;

    user.structure = await structureRepository.findOneBy({
      id: 5,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("Date nulle", async () => {
    expect(generateDateForCerfa(null)).toEqual({
      annee: "",
      heure: "",
      jour: "",
      minutes: "",
      mois: "",
    });
  });

  it("Date au format Europe/Paris, par défaut", async () => {
    expect(generateDateForCerfa(new Date())).toEqual({
      annee: "2023",
      heure: "21",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });

  it("[TIMEZONE] Date au format America/Cayenne -4h (heure d'hiver)", async () => {
    expect(generateDateForCerfa(new Date(), user)).toEqual({
      annee: "2023",
      heure: "17",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });

  it("[Timezone] Date in text format for in America/Cayenne -4h format (winter time)", async () => {
    expect(generateDateForCerfa("2023-03-22T20:45:47.433Z", user)).toEqual({
      annee: "2023",
      heure: "17",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });
});
