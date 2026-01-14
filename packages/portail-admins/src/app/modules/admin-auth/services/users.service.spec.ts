import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
  });
  it("should be created", () => {
    const service: UsersService = TestBed.inject(UsersService);
    expect(service).toBeTruthy();
  });
});
