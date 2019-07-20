import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule, HttpHandler } from "@angular/common/http";
import { async, inject, TestBed } from "@angular/core/testing";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterModule
} from "@angular/router";
import { Observable, of } from "rxjs";
import { StructureService } from "../modules/structures/services/structure.service";
import { AuthService } from "../services/auth.service";
import { StructureGuard } from "./structure-guard";

describe("StructureGuard", () => {
  let structureGuard: StructureGuard;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let structureService: StructureService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        StructureGuard,
        StructureService,
        AuthService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: 1 } }
          }
        },
        { provide: APP_BASE_HREF, useValue: "/" }
      ]
    });
    router = TestBed.get(Router);
    activatedRoute = TestBed.get(ActivatedRoute);
    structureService = TestBed.get(StructureService);
  }));

  it("should be created", inject(
    [StructureGuard],
    (service: StructureGuard) => {
      expect(service).toBeTruthy();
    }
  ));

  it("should navigate to home for a logged out user", () => {
    console.log("--->activatedRoute");
    console.log(activatedRoute);

    structureGuard = new StructureGuard(activatedRoute, structureService);

    expect(structureGuard.canActivate()).toEqual(false);
  });
});
