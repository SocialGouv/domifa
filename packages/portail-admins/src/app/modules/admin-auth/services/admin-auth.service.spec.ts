import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { AdminAuthService } from "./admin-auth.service";

describe("AdminAuthService", () => {
  let service: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule],
      providers: [AdminAuthService],
    });
    service = TestBed.inject(AdminAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
