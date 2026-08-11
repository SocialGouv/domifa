import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { PortailStatsAuthService } from "./portail-stats-auth.service";

describe("PortailStatsAuthService", () => {
  let service: PortailStatsAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        PortailStatsAuthService,
      ],
    });
    service = TestBed.inject(PortailStatsAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
