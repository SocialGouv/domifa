import { typeDomSchema } from "./typeDomSchema.yup";

describe("typeDomSchema schema", () => {
  it("valid typeDomSchema", async () => {
    expect(await typeDomSchema.validate("PREMIERE_DOM")).toEqual(
      "PREMIERE_DOM"
    );
    expect(await typeDomSchema.validate("PREMIERE")).toEqual("PREMIERE_DOM");
    expect(await typeDomSchema.validate("RENOUVELLEMENT")).toEqual(
      "RENOUVELLEMENT"
    );
    expect(await typeDomSchema.validate(undefined)).toBeUndefined();
  });
  it("invalid typeDomSchema", async () => {
    await expect(typeDomSchema.validate("XXXX")).rejects.toThrow();
    await expect(typeDomSchema.validate("PREM")).rejects.toThrow();
  });
});
