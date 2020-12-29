import { TestBed } from "@angular/core/testing";
import { StructuresModule } from "./structures.module";

describe("StructuresModule", () => {
  let pipe: StructuresModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StructuresModule] });
    pipe = TestBed.inject(StructuresModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
