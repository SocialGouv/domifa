import { appUserBuilder } from "./app-user-builder.service";

describe("appUserBuilder", () => {
  it("appUserBuilder.buildAppUser create default user", () => {
    expect(appUserBuilder.buildAppUser()).toBeDefined();
    const u = appUserBuilder.buildAppUser({});
    expect(u).toBeDefined();
    expect(u.verified).toBeFalsy();
    expect(u.access_token).toBeUndefined();
  });
  it("appUserBuilder.buildAppUser remove password", () => {
    const u = appUserBuilder.buildAppUser({
      password: "test",
    });
    expect(u).toBeDefined();
    expect(u.password).toEqual("");
  });
  it("appUserBuilder.buildAppUser build dates from strings", () => {
    const u = appUserBuilder.buildAppUser({
      lastLogin: (`2014-10-15` as unknown) as Date,
      passwordLastUpdate: (`2015-10-15` as unknown) as Date,
    });
    expect(u).toBeDefined();
    expect(u.lastLogin).toBeDefined();
    expect(u.lastLogin.getFullYear()).toEqual(2014);
    expect(u.passwordLastUpdate).toBeDefined();
    expect(u.passwordLastUpdate.getFullYear()).toEqual(2015);
  });
});
