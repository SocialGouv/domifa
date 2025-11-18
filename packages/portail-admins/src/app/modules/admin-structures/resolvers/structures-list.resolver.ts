import { ResolveFn } from "@angular/router";
import { map, Observable, of, tap } from "rxjs";
import { ApiStructureAdmin } from "../types";
import { AdminStructuresApiClient } from "../../shared/services";
import { inject } from "@angular/core";
import { structuresCache } from "../../shared/store";
import { structuresListModelBuilder } from "../utils";
export const structuresListResolver: ResolveFn<
  ApiStructureAdmin[]
> = (): Observable<ApiStructureAdmin[]> => {
  const adminStructureApiClient = inject(AdminStructuresApiClient);
  if (!structuresCache.getStructureListData()?.length) {
    return adminStructureApiClient.getAdminStructureListData().pipe(
      map((structureList) =>
        structuresListModelBuilder.buildStructuresViewModel(structureList)
      ),
      tap((list) => structuresCache.setStructureListData(list))
    );
  }

  return of(structuresCache.getStructureListData());
};
