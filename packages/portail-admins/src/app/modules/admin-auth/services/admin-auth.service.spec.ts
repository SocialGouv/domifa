import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { AdminAuthService } from "./admin-auth.service";
import { provideHttpClient } from "@angular/common/http";
import { structuresFeature, usersFeature } from "src/app/modules/shared/store";

describe("AdminAuthService", () => {
  let service: AdminAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          [structuresFeature.name]: structuresFeature.reducer,
          [usersFeature.name]: usersFeature.reducer,
        }),
      ],
      providers: [provideRouter([]), provideHttpClient(), AdminAuthService],
    });
    service = TestBed.inject(AdminAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
