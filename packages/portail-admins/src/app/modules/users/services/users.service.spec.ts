import { TestBed } from "@angular/core/testing";
import { UsersService } from "./users.service";
import { provideHttpClient } from "@angular/common/http";

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
