import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";

import { PortailUsagersService } from "./portail-usagers.service";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { UsagerService } from "../../usager-shared/services";
import { RouterModule } from "@angular/router";

describe("PortailUsagersService", () => {
  let service: PortailUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        CommonModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        UsagerService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(PortailUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
