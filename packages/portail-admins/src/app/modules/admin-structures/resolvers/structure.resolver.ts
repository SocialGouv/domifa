import { ResolveFn } from "@angular/router";
import { ApiStructureAdmin } from "../types";
import { structuresCache } from "../../shared/store";

export const structureResolver: ResolveFn<ApiStructureAdmin | undefined> = (
  route
): ApiStructureAdmin | undefined => {
  const structureId = parseInt(route.params["structureId"]);
  return structuresCache.getStructureById(structureId);
};
