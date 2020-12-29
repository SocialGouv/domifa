import { TestBed } from "@angular/core/testing";
import { UsagersModule } from "./usagers.module";

describe("UsagersModule", () => {
  let pipe: UsagersModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UsagersModule] });
    pipe = TestBed.inject(UsagersModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
