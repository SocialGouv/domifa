import { DateFrUTCSchema } from "./DateFrUTCSchema.joi";

describe("DateFrUTCSchema schema", () => {
  it("valid date", async () => {
    expect(await DateFrUTCSchema().validateAsync("15/03/2020")).toEqual(
      new Date(Date.UTC(2020, 3 - 1, 15))
    );
    expect(await DateFrUTCSchema().validateAsync("31/12/1920")).toEqual(
      new Date(Date.UTC(1920, 12 - 1, 31))
    );
  });
  it("invalid date", async () => {
    await expect(
      DateFrUTCSchema().validateAsync("15-12-1920")
    ).rejects.toThrow();
    await expect(
      DateFrUTCSchema().validateAsync("32/12/1920")
    ).rejects.toThrow();
    await expect(
      DateFrUTCSchema().validateAsync("15/13/1920")
    ).rejects.toThrow();
    await expect(
      DateFrUTCSchema().validateAsync("32/12/1920")
    ).rejects.toThrow();
    await expect(
      DateFrUTCSchema().validateAsync("32/12/192")
    ).rejects.toThrow();
  });
});
