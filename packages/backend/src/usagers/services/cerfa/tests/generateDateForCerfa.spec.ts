import {
  userStructureRepository,
  structureRepository,
} from "../../../../database";
import { AppTestContext, AppTestHelper } from "../../../../util/test";

import { UserStructureAuthenticated } from "../../../../_common/model";
import { generateDateForCerfa } from "../generateDateForCerfa.service";

describe("generateDateForCerfa", () => {
  let context: AppTestContext;

  afterAll(async () => {
    jest.useRealTimers();
    await AppTestHelper.tearDownTestApp(context);
  });

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({});

    //Date de référence : 22 Mars 2023
    jest
      .useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "clearImmediate",
          "setInterval",
          "clearInterval",
          "setTimeout",
          "clearTimeout",
        ],
      })
      .setSystemTime(new Date("2023-03-22T20:45:47.433Z"));
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
    const user: UserStructureAuthenticated =
      await userStructureRepository.findOne({ id: 11 });
    const structure = await structureRepository.findOneBy({
      id: 5,
    });

    user.structure = structure;

    expect(generateDateForCerfa(new Date(), user)).toEqual({
      annee: "2023",
      heure: "17",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });
});
