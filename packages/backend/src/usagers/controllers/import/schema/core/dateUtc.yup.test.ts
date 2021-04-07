import { dateUtcSchema } from "./dateUtc.yup";

describe("dateUtcSchema schema", () => {
  it("valid date", async () => {
    expect(await dateUtcSchema().validate("15/03/2020")).toEqual(
      new Date(Date.UTC(2020, 3 - 1, 15))
    );
    expect(await dateUtcSchema().validate("31/12/1920")).toEqual(
      new Date(Date.UTC(1920, 12 - 1, 31))
    );
  });
  it("invalid date", async () => {
    await expect(dateUtcSchema().validate("15-12-1920")).rejects.toThrow();
    await expect(dateUtcSchema().validate("32/12/1920")).rejects.toThrow();
    await expect(dateUtcSchema().validate("15/13/1920")).rejects.toThrow();
    await expect(dateUtcSchema().validate("32/12/1920")).rejects.toThrow();
    await expect(dateUtcSchema().validate("32/12/192")).rejects.toThrow();
    await expect(dateUtcSchema().validate("undefined")).rejects.toThrow();
    await expect(dateUtcSchema().validate("2019-12-10")).rejects.toThrow();
    await expect(dateUtcSchema().validate("1/00/1900")).rejects.toThrow();
  });
  it("valid date with valid validation", async () => {
    expect(
      await dateUtcSchema()
        .min(new Date(Date.UTC(2020, 3 - 1, 15)))
        .max(new Date(Date.UTC(2020, 3 - 1, 15)))
        .validate("15/03/2020")
    ).toEqual(new Date(Date.UTC(2020, 3 - 1, 15)));
  });
  it("valid date with invalid validation", async () => {
    await expect(
      dateUtcSchema()
        .min(new Date(Date.UTC(2020, 3 - 1, 14)))
        .max(new Date(Date.UTC(2020, 3 - 1, 16)))
        .validate("17/03/2020")
    ).rejects.toThrow();
  });
});
