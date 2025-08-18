import { provideUserIdleConfig } from "angular-user-idle";
import { inject, TestBed } from "@angular/core/testing";

import { AuthService } from "./auth.service";
import { APP_BASE_HREF } from "@angular/common";

import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("AuthService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        AuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
        provideUserIdleConfig({ idle: 3600, timeout: 60, ping: 20 }),
      ],
    });
  });

  it("should be created", inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
