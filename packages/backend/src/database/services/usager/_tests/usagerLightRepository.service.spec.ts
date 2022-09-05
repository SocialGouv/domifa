import { AppTestHelper } from "../../../../util/test";
import { usagerLightRepository } from "../usagerLightRepository.service";

describe("usagerLightRepository", () => {
  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  it("findDoublons found", async () => {
    const doublons = await usagerLightRepository.findDoublons({
      nom: "DUPONT",
      prenom: "FRED",
      ref: 4,
      structureId: 1,
    });
    expect(doublons.length).toEqual(1);
    const doublon = doublons[0];
    expect(doublon.nom).toEqual("Dupont");
    expect(doublon.prenom).toEqual("Fred");
  });
  it("findDoublons not found (same id)", async () => {
    const doublons = await usagerLightRepository.findDoublons({
      nom: "DUPONT",
      prenom: "FRED",
      ref: 3,
      structureId: 1,
    });
    expect(doublons.length).toEqual(0);
  });
  it("findDoublons NOT found", async () => {
    const doublons = await usagerLightRepository.findDoublons({
      nom: "DUPONT",
      prenom: "Vladimir",
      ref: 3,
      structureId: 1,
    });
    expect(doublons.length).toEqual(0);
  });

  it("findNextRendezVous", async () => {
    const rendezVous = await usagerLightRepository.findNextRendezVous({
      userId: 2,
      dateRefNow: new Date(Date.UTC(2019, 1, 1)),
    });
    expect(rendezVous.length).toEqual(1);
  });
});
