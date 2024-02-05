import { getDepartementFromCodePostal } from "./departement-helper.service";

describe("Departement helper Service", () => {
  it("common case", () => {
    expect(getDepartementFromCodePostal("75000")).toEqual("75");
    expect(getDepartementFromCodePostal("49530")).toEqual("49");
    expect(getDepartementFromCodePostal("33600")).toEqual("33");
    expect(getDepartementFromCodePostal("01100")).toEqual("01");
  });

  it("invalid format", () => {
    expect(() => getDepartementFromCodePostal("7500")).toThrow();
    expect(() => getDepartementFromCodePostal("750000")).toThrow();
  });

  it("corse", () => {
    expect(getDepartementFromCodePostal("20146")).toEqual("2A");
    expect(getDepartementFromCodePostal("20000")).toEqual("2A");
    expect(getDepartementFromCodePostal("20090")).toEqual("2A");
    expect(getDepartementFromCodePostal("20200")).toEqual("2B");
    expect(getDepartementFromCodePostal("20600")).toEqual("2B");
  });

  it("exceptions", () => {
    expect(getDepartementFromCodePostal("97133")).toEqual("977");
    expect(getDepartementFromCodePostal("97150")).toEqual("978");
    expect(getDepartementFromCodePostal("05110")).toEqual("04");
    expect(getDepartementFromCodePostal("73670")).toEqual("38");
    expect(getDepartementFromCodePostal("01590")).toEqual("39");
  });
});
