import { TestBed } from "@angular/core/testing";
import { ManageUsagersModule } from "./manage-usagers.module";

describe("UsagersModule", () => {
  let pipe: ManageUsagersModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ManageUsagersModule] });
    pipe = TestBed.inject(ManageUsagersModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
