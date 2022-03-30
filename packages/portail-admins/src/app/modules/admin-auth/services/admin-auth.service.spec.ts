import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AdminAuthService } from "./admin-auth.service";

describe("AdminAuthService", () => {
  let service: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AdminAuthService],
    });
    service = TestBed.inject(AdminAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
