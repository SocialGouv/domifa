import { provideUserIdleConfig } from "angular-user-idle";
import { inject, TestBed } from "@angular/core/testing";

import { AuthService } from "./auth.service";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";

describe("AuthService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
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
