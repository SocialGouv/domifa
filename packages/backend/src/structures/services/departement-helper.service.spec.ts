import { departementHelper } from "./departement-helper.service";

describe("Departement helper Service", () => {
  it("common case", () => {
    expect(departementHelper.getDepartementFromCodePostal("75000")).toEqual(
      "75"
    );
    expect(departementHelper.getDepartementFromCodePostal("49530")).toEqual(
      "49"
    );
    expect(departementHelper.getDepartementFromCodePostal("33600")).toEqual(
      "33"
    );
    expect(departementHelper.getDepartementFromCodePostal("01100")).toEqual(
      "01"
    );
  });

  it("invalid format", () => {
    expect(() =>
      departementHelper.getDepartementFromCodePostal("7500")
    ).toThrow();
    expect(() =>
      departementHelper.getDepartementFromCodePostal("750000")
    ).toThrow();
  });

  it("corse", () => {
    expect(departementHelper.getDepartementFromCodePostal("20146")).toEqual(
      "2A"
    );
    expect(departementHelper.getDepartementFromCodePostal("20000")).toEqual(
      "2A"
    );
    expect(departementHelper.getDepartementFromCodePostal("20090")).toEqual(
      "2A"
    );
    expect(departementHelper.getDepartementFromCodePostal("20200")).toEqual(
      "2B"
    );
    expect(departementHelper.getDepartementFromCodePostal("20600")).toEqual(
      "2B"
    );
  });

  it("exceptions", () => {
    expect(departementHelper.getDepartementFromCodePostal("97133")).toEqual(
      "977"
    );
    expect(departementHelper.getDepartementFromCodePostal("97150")).toEqual(
      "978"
    );
    expect(departementHelper.getDepartementFromCodePostal("05110")).toEqual(
      "04"
    );
    expect(departementHelper.getDepartementFromCodePostal("73670")).toEqual(
      "38"
    );
    expect(departementHelper.getDepartementFromCodePostal("01590")).toEqual(
      "39"
    );
  });
});
