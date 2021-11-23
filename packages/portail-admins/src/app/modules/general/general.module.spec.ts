import { TestBed } from "@angular/core/testing";
import { GeneralModule } from "./general.module";

describe("GeneralModule", () => {
  let pipe: GeneralModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GeneralModule] });
    pipe = TestBed.inject(GeneralModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
