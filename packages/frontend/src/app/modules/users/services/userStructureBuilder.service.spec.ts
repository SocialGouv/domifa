import { userStructureBuilder } from "./userStructureBuilder.service";

describe("userStructureBuilder", () => {
  it("userStructureBuilder.buildUserStructure create default user", () => {
    expect(userStructureBuilder.buildUserStructure()).toBeDefined();
    const u = userStructureBuilder.buildUserStructure({});
    expect(u).toBeDefined();
    expect(u.verified).toBeFalsy();
    expect(u.access_token).toBeUndefined();
  });
  it("userStructureBuilder.buildUserStructure remove password", () => {
    const u = userStructureBuilder.buildUserStructure({
      password: "test",
    });
    expect(u).toBeDefined();
    expect(u.password).toEqual("");
  });
  it("userStructureBuilder.buildUserStructure build dates from strings", () => {
    const u = userStructureBuilder.buildUserStructure({
      lastLogin: `2014-10-15` as unknown as Date,
      passwordLastUpdate: `2015-10-15` as unknown as Date,
    });
    expect(u).toBeDefined();
    expect(u.lastLogin).toBeDefined();
    expect(u.lastLogin.getFullYear()).toEqual(2014);
    expect(u.passwordLastUpdate).toBeDefined();
    expect(u.passwordLastUpdate.getFullYear()).toEqual(2015);
  });
});
