import { provideHttpClient } from "@angular/common/http";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { UsagerService } from "../../usager-shared/services/usagers.service";

import { UsagerProfilService } from "./usager-profil.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { RouterModule } from "@angular/router";

describe("UsagerProfilService", () => {
  let service: UsagerProfilService;

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
    service = TestBed.inject(UsagerProfilService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
