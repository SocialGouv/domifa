import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ManageUsagersService } from "./manage-usagers.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";

describe("ManageUsagersService", () => {
  let service: ManageUsagersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        CommonModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(ManageUsagersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("refreshes from the server time of the full load, then from the latest change", () => {
    expect(service.hasSyncCursor()).toBe(false);

    service.fetchSearchPageUsagerData({ chargerTousRadies: false }).subscribe();
    http.expectOne(`${service.endPoint}?chargerTousRadies=false`).flush({
      usagers: [],
      usagersRadiesTotalCount: 0,
      syncedAt: "2026-10-26T10:00:00.000Z",
    });
    expect(service.hasSyncCursor()).toBe(true);

    service.updateManage().subscribe();
    const first = http.expectOne(
      (req) => req.url === `${service.endPoint}update-manage`
    );
    expect(first.request.params.get("since")).toEqual(
      "2026-10-26T10:00:00.000Z"
    );
    first.flush([
      { uuid: "a", statut: "VALIDE", updatedAt: "2026-10-26T10:03:00.000Z" },
      { uuid: "b", statut: "VALIDE", updatedAt: "2026-10-26T10:01:00.000Z" },
    ]);

    service.updateManage().subscribe();
    const second = http.expectOne(
      (req) => req.url === `${service.endPoint}update-manage`
    );
    expect(second.request.params.get("since")).toEqual(
      "2026-10-26T10:03:00.000Z"
    );
    second.flush([]);
  });
});
