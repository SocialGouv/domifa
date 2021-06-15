import { typeDomSchema } from "./typeDomSchema.yup";

describe("typeDomSchema schema", () => {
  it("valid typeDomSchema", async () => {
    expect(await typeDomSchema.validate("PREMIERE")).toEqual("PREMIERE_DOM");
    expect(await typeDomSchema.validate("RENOUVELLEMENT")).toEqual(
      "RENOUVELLEMENT"
    );
    expect(await typeDomSchema.validate(undefined)).toBeUndefined();
  });
  it("invalid typeDomSchema", async () => {
    await expect(typeDomSchema.validate("PREMIERE_DOM")).rejects.toThrow();
  });
});
