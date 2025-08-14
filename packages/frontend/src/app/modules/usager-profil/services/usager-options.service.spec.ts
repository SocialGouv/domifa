import { provideHttpClient } from "@angular/common/http";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { UsagerService } from "../../usager-shared/services/usagers.service";

import { UsagerOptionsService } from "./usager-options.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { RouterModule } from "@angular/router";

describe("UsagerOptionsService", () => {
  let service: UsagerOptionsService;

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
    service = TestBed.inject(UsagerOptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
