import { ResolveFn } from "@angular/router";
import { Observable, of, tap } from "rxjs";
import { AdminStructuresApiClient } from "../../shared/services";
import { inject } from "@angular/core";
import { structuresCache } from "../../shared/store";
import { StructureAdmin } from "@domifa/common";
export const structuresListResolver: ResolveFn<
  StructureAdmin[]
> = (): Observable<StructureAdmin[]> => {
  const adminStructureApiClient = inject(AdminStructuresApiClient);
  if (!structuresCache.getStructureListData()?.length) {
    return adminStructureApiClient
      .getAdminStructureListData()
      .pipe(tap((list) => structuresCache.setStructureListData(list)));
  }

  return of(structuresCache.getStructureListData());
};
