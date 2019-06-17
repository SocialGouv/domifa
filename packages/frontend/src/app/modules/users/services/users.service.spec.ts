import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { UsagerService } from "../../usagers/services/usager.service";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [UsagerService]
    });
  });
  it("should be created", () => {
    const service: UsersService = TestBed.get(UsersService);
    expect(service).toBeTruthy();
  });
});
