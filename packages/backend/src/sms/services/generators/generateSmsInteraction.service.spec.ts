import { InteractionDto } from "../../../interactions/interactions.dto";
import { generateSmsInteraction } from "./generateSmsInteraction.service";

describe("generate SMS", () => {
  beforeEach(async () => {});

  it("generate SMS", () => {
    const mockInteraction: InteractionDto = {
      type: "courrierIn",
      content: "",
      nbCourrier: 2,
      structureId: 1,
      usagerRef: 1,
      userId: 1,
      userName: "USER NAME",
      dateInteraction: new Date(),
    };

    const smsGenerated = generateSmsInteraction(mockInteraction, "DOMIFA");
    expect(smsGenerated).toEqual(
      "Bonjour \nVous avez reçu 2 nouveaux courriers\n\nDOMIFA"
    );
  });
});
