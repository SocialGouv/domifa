import { ResolveFn } from "@angular/router";
import { map, Observable, of, tap } from "rxjs";
import { AdminStructuresApiClient } from "../../shared/services";
import { inject } from "@angular/core";
import { structuresCache } from "../../shared/store";
import { structuresListModelBuilder } from "../utils";
import { StructureAdmin } from "@domifa/common";
export const structuresListResolver: ResolveFn<
  StructureAdmin[]
> = (): Observable<StructureAdmin[]> => {
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
