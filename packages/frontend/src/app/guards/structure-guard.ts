import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StructureService } from "../modules/structures/services/structure.service";

@Injectable({
  providedIn: "root",
})
export class StructureGuard implements CanActivate {
  constructor(private structureService: StructureService) {}

  public canActivate(
    activatedRoute: ActivatedRouteSnapshot
  ): Observable<boolean> {
    const id = activatedRoute.params.id;
    return this.structureService.findOne(id).pipe(
      map(() => {
        return true;
      })
    );
  }
}
