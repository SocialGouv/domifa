import { ResolveFn } from "@angular/router";
import { structuresCache } from "../../shared/store";
import { StructureAdmin } from "@domifa/common";

export const structureResolver: ResolveFn<StructureAdmin | undefined> = (
  route
): StructureAdmin | undefined => {
  const structureId = parseInt(route.params["structureId"]);
  return structuresCache.getStructureById(structureId);
};
