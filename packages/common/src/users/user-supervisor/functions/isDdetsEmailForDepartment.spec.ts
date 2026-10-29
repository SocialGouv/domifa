import {
  isDdetsEmailForDepartment,
  isDdetsSelfServiceDepartment,
} from "./isDdetsEmailForDepartment";

describe("isDdetsEmailForDepartment", () => {
  it("accepts the domain of the department", () => {
    expect(
      isDdetsEmailForDepartment("jean.dupont@ille-et-vilaine.gouv.fr", "35")
    ).toBe(true);
    expect(
      isDdetsEmailForDepartment(" Jean.Dupont@Ille-et-Vilaine.gouv.fr ", "35")
    ).toBe(true);
    expect(isDdetsEmailForDepartment("marie.martin@deets.gouv.fr", "971")).toBe(
      true
    );
  });

  it("rejects the domain of another department", () => {
    expect(isDdetsEmailForDepartment("jean.dupont@nord.gouv.fr", "35")).toBe(
      false
    );
  });

  it("accepts a local part without a dot", () => {
    expect(
      isDdetsEmailForDepartment("jdupont@ille-et-vilaine.gouv.fr", "35")
    ).toBe(true);
  });

  it("rejects departments outside the allowlist", () => {
    expect(
      isDdetsEmailForDepartment("jean.dupont@seine-saint-denis.gouv.fr", "93")
    ).toBe(false);
    expect(isDdetsSelfServiceDepartment("93")).toBe(false);
    expect(isDdetsSelfServiceDepartment("35")).toBe(true);
  });
});
