import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
  });
  it("should be created", () => {
    const service: UsersService = TestBed.inject(UsersService);
    expect(service).toBeTruthy();
  });
});
