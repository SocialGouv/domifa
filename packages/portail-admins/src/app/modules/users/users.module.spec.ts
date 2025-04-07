import { TestBed } from "@angular/core/testing";
import { UsersModule } from "./users.module";

describe("UsersModule", () => {
  let pipe: UsersModule;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UsersModule] });
    pipe = TestBed.inject(UsersModule);
  });

  it("can load instance", () => {
    expect(pipe).toBeTruthy();
  });
});
