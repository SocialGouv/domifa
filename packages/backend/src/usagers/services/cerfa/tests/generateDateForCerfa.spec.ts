import {
  userStructureRepository,
  structureRepository,
} from "../../../../database";
import { UsersModule } from "../../../../users/users.module";
import { AppTestHelper } from "../../../../util/test";
import { UserStructureAuthenticated } from "../../../../_common/model";
import { generateDateForCerfa } from "../generateDateForCerfa.service";
import MockDate from "mockdate";

describe("generateDateForCerfa", () => {
  beforeAll(async () => {
    // On défini la valeur que devrait avoir new Date();
    MockDate.set("2022-03-22T20:45:47.433Z");

    await AppTestHelper.bootstrapTestApp({
      imports: [UsersModule],
    });
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
      annee: "2022",
      heure: "21",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });

  it("[TIMEZONE] Date au format America/Cayenne -4h (heure d'hiver)", async () => {
    const user: UserStructureAuthenticated =
      await userStructureRepository.findOne({ id: 11 });
    const structure = await structureRepository.findOne({
      id: 5,
    });

    user.structure = structure;

    expect(generateDateForCerfa(new Date(), user)).toEqual({
      annee: "2022",
      heure: "17",
      jour: "22",
      minutes: "45",
      mois: "03",
    });
  });
});
