import { Injectable } from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { StructureService } from "../modules/structures/services/structure.service";
import { Structure } from "../modules/structures/structure.interface";

@Injectable({
  providedIn: "root"
})
export class StructureGuard implements CanActivate {
  constructor(
    private route: ActivatedRoute,
    private structureService: StructureService
  ) {}

  public canActivate(): boolean {
    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;
      this.structureService.findOne(id).subscribe(
        (structure: Structure) => {
          if (structure !== null && structure !== undefined) {
            console.log("--> --> 1");
            return true;
          }
        },
        error => {
          console.log("--> --> 2");
          return false;
        }
      );
    }
    console.log("--> --> 3");
    return false;
  }
}
