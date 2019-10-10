import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { async, inject, TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterModule } from "@angular/router";
import { StructureService } from "../modules/structures/services/structure.service";
import { AuthService } from "../services/auth.service";
import { StructureGuard } from "./structure-guard";

describe("StructureGuard", () => {
  let structureGuard: StructureGuard;

  let activatedRoute: ActivatedRouteSnapshot;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [
        StructureGuard,
        StructureService,
        AuthService,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            params: { id: 1 }
          }
        },
        { provide: APP_BASE_HREF, useValue: "/" }
      ]
    });

    activatedRoute = TestBed.get(ActivatedRouteSnapshot);

    structureGuard = TestBed.get(StructureGuard);
  }));

  it("Structure guard - Creation", inject(
    [StructureGuard],
    (service: StructureGuard) => {
      expect(service).toBeTruthy();
    }
  ));

  it("✅ Structure exist", async(() => {
    structureGuard.canActivate(activatedRoute).subscribe((value: any) => {
      expect(value).toEqual(true);
    });
  }));

  it("❌ Structure not exist - 404 error", async(() => {
    activatedRoute.params.id = 100;
    structureGuard.canActivate(activatedRoute).subscribe(
      response => {
        expect(response).toBeDefined();
      },
      error => {
        expect(error).toBeDefined();
      }
    );
  }));
});
