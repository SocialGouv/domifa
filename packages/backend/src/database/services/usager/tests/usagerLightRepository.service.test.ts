import { Connection } from "typeorm";
import { AppTestHelper } from "../../../../util/test";
import { usagerLightRepository } from "../usagerLightRepository.service";

describe("usagerLightRepository", () => {
  let postgresTypeormConnection: Connection;

  beforeAll(async () => {
    postgresTypeormConnection = await AppTestHelper.bootstrapTestConnection();
  });
  afterAll(async () => {
    AppTestHelper.tearDownTestConnection({ postgresTypeormConnection });
  });

  it("findDoublon found", async () => {
    const doublon = await usagerLightRepository.findDoublon({
      nom: "DUPONT",
      prenom: "FRED",
      ref: 4,
      structureId: 1,
    });
    expect(doublon).toBeDefined();
    expect(doublon.nom).toEqual("Dupont");
    expect(doublon.prenom).toEqual("Fred");
  });
  it("findDoublon not found (same id)", async () => {
    const doublon = await usagerLightRepository.findDoublon({
      nom: "DUPONT",
      prenom: "FRED",
      ref: 3,
      structureId: 1,
    });
    expect(doublon).toBeUndefined();
  });
  it("findDoublon NOT found", async () => {
    const doublon = await usagerLightRepository.findDoublon({
      nom: "DUPONT",
      prenom: "Vladimir",
      ref: 3,
      structureId: 1,
    });
    expect(doublon).toBeUndefined();
  });

  it("findNextRendezVous", async () => {
    const rendezVous = await usagerLightRepository.findNextRendezVous({
      userId: 1,
      dateRefNow: new Date(Date.UTC(2020, 1, 1)),
    });
    expect(rendezVous.length).toEqual(1);
  });
});
