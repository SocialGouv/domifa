import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { StructureService } from "../modules/structures/services/structure.service";
import { Structure } from "../modules/structures/structure.interface";

@Injectable({
  providedIn: "root"
})
export class StructureGuard implements CanActivate {
  constructor(
    private router: Router,
    private structureService: StructureService
  ) {}

  public canActivate(activatedRoute: ActivatedRouteSnapshot): any {
    const id = activatedRoute.params.id;
    if (!id) {
      this.router.navigate(["/404"]);
      return false;
    }

    return this.structureService.findOne(id).pipe(
      map(
        (structure: Structure) => {
          if (structure !== null && structure !== undefined) {
            return true;
          }
        },
        (error: any) => {
          this.router.navigate(["/404"]);
          return false;
        }
      )
    );
  }
}
