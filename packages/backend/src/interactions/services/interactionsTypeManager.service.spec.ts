import { interactionsTypeManager } from "./interactionsTypeManager.service";

describe("interactionsTypeManager", () => {
  it("interactionsTypeManager.getDirection", async () => {
    expect(
      interactionsTypeManager.getDirection({ type: "courrierIn" })
    ).toEqual("in");
    expect(
      interactionsTypeManager.getDirection({ type: "courrierOut" })
    ).toEqual("out");
    expect(
      interactionsTypeManager.getDirection({ type: "recommandeIn" })
    ).toEqual("in");
    expect(
      interactionsTypeManager.getDirection({ type: "recommandeOut" })
    ).toEqual("out");
    expect(interactionsTypeManager.getDirection({ type: "colisIn" })).toEqual(
      "in"
    );
    expect(interactionsTypeManager.getDirection({ type: "colisOut" })).toEqual(
      "out"
    );
    expect(interactionsTypeManager.getDirection({ type: "appel" })).toEqual(
      "other"
    );
    expect(interactionsTypeManager.getDirection({ type: "visite" })).toEqual(
      "other"
    );
    expect(interactionsTypeManager.getDirection({ type: "npai" })).toEqual(
      "other"
    );
  });

  it("interactionsTypeManager.getOppositeDirection", async () => {
    expect(interactionsTypeManager.getOppositeDirection("out")).toEqual("in");
    expect(interactionsTypeManager.getOppositeDirection("in")).toEqual("out");
    expect(
      interactionsTypeManager.getOppositeDirection("other")
    ).toBeUndefined();
  });
  it("interactionsTypeManager.getBaseDirectionalType", async () => {
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "courrierIn" })
    ).toEqual("courrier");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "courrierOut" })
    ).toEqual("courrier");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "recommandeIn" })
    ).toEqual("recommande");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "recommandeOut" })
    ).toEqual("recommande");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "colisIn" })
    ).toEqual("colis");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "colisOut" })
    ).toEqual("colis");
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "appel" })
    ).toBeUndefined();
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "visite" })
    ).toBeUndefined();
    expect(
      interactionsTypeManager.getBaseDirectionalType({ type: "npai" })
    ).toBeUndefined();
  });
  it("interactionsTypeManager.getOppositeDirectionalType", async () => {
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "courrierIn" })
    ).toEqual("courrierOut");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({
        type: "courrierOut",
      })
    ).toEqual("courrierIn");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({
        type: "recommandeIn",
      })
    ).toEqual("recommandeOut");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({
        type: "recommandeOut",
      })
    ).toEqual("recommandeIn");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "colisIn" })
    ).toEqual("colisOut");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "colisOut" })
    ).toEqual("colisIn");
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "appel" })
    ).toBeUndefined();
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "visite" })
    ).toBeUndefined();
    expect(
      interactionsTypeManager.getOppositeDirectionalType({ type: "npai" })
    ).toBeUndefined();
  });
});
