import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });
  it("should be created", () => {
    const service: UsersService = TestBed.inject(UsersService);
    expect(service).toBeTruthy();
  });
});
