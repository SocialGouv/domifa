import { TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { JwtInterceptor } from "src/app/interceptors/jwt.interceptor";
import { ServerErrorInterceptor } from "src/app/interceptors/server-error.interceptor";
import { StructureStatsService } from "./structure-stats.service";
import { RouterModule } from "@angular/router";

describe("StatsService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: ServerErrorInterceptor,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
  );

  it("should be created", () => {
    const service: StructureStatsService = TestBed.inject(
      StructureStatsService
    );
    expect(service).toBeTruthy();
  });
});
