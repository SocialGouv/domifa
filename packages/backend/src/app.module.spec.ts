import { AppModule } from "./app.module";

describe("AppModule", () => {
  let appModule: AppModule;

  beforeAll(() => {
    appModule = new AppModule();
  });

  it("should create an instance", () => {
    expect(appModule).toBeTruthy();
  });
});
