import { InteractionDto } from "../../../interactions/interactions.dto";
import { generateSmsInteraction } from "./generateSmsInteraction.service";

describe("generate SMS", () => {
  beforeEach(async () => {});

  it("generate SMS", () => {
    const firstInteraction: InteractionDto = {
      type: "courrierIn",
      content: "",
      nbCourrier: 2,
      structureId: 1,
      usagerRef: 1,
      userId: 1,
      userName: "USER NAME",
      dateInteraction: new Date(),
    };

    const secondInteraction: InteractionDto = {
      type: "recommandeIn",
      content: "",
      nbCourrier: 1,
      structureId: 1,
      usagerRef: 1,
      userId: 1,
      userName: "USER NAME",
      dateInteraction: new Date(),
    };

    const thirdInteraction: InteractionDto = {
      type: "colisIn",
      content: "",
      nbCourrier: 19,
      structureId: 1,
      usagerRef: 1,
      userId: 1,
      userName: "USER NAME",
      dateInteraction: new Date(),
    };

    const fourInteraction: InteractionDto = {
      type: "courrierIn",
      content: "",
      nbCourrier: 1,
      structureId: 1,
      usagerRef: 1,
      userId: 1,
      userName: "USER NAME",
      dateInteraction: new Date(),
    };

    const smsOne = generateSmsInteraction(firstInteraction, "DOMIFA");
    expect(smsOne).toEqual(
      "Bonjour, \n\nVous avez reçu 2 nouveaux courriers\n\nDOMIFA"
    );

    const smsTwo = generateSmsInteraction(secondInteraction, "DOMIFA");
    expect(smsTwo).toEqual(
      "Bonjour, \n\nVous avez reçu 1 nouvel avis de passage\n\nDOMIFA"
    );

    const smsThree = generateSmsInteraction(thirdInteraction, "DOMIFA_TEST");
    expect(smsThree).toEqual(
      "Bonjour, \n\nVous avez reçu 19 nouveaux colis\n\nDOMIFA_TEST"
    );

    const smsFour = generateSmsInteraction(fourInteraction, "DOMIFA_75T");
    expect(smsFour).toEqual(
      "Bonjour, \n\nVous avez reçu 1 nouveau courrier\n\nDOMIFA_75T"
    );
  });
});
