import { TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { AdminAuthService } from "./admin-auth.service";
import { provideHttpClient } from "@angular/common/http";

describe("AdminAuthService", () => {
  let service: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [provideHttpClient(), AdminAuthService],
    });
    service = TestBed.inject(AdminAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
