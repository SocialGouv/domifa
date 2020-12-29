import { TestBed } from "@angular/core/testing";
import { StatsModule } from "./stats.module";

describe("StatsModule", () => {
  let pipe: StatsModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StatsModule] });
    pipe = TestBed.inject(StatsModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
