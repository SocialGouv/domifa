import { TestBed } from "@angular/core/testing";

import { StructureService } from "./structure.service";
import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { JwtInterceptor, ServerErrorInterceptor } from "../../../interceptors";

describe("StructureService", () => {
  let service: StructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
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
    });
    service = TestBed.inject(StructureService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
