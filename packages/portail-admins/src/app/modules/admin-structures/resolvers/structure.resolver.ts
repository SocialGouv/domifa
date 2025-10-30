import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Observable } from "rxjs";
import { StructureCommon } from "@domifa/common";
import { StructureService } from "../../structure/services/structure.service";

export const structureResolver: ResolveFn<StructureCommon> = (
  route
): Observable<StructureCommon> => {
  const userService = inject(StructureService);
  return userService.getStructure(route.params["structureId"]);
};
