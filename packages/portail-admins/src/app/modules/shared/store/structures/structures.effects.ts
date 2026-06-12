import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, filter, map, of, switchMap, withLatestFrom } from "rxjs";

import { AdminStructuresApiClient } from "../../services/api/admin-structures-api-client.service";

import { StructuresActions } from "./structures.actions";
import { selectAreStructuresLoaded } from "./structures.selectors";

@Injectable()
export class StructuresEffects {
  public readonly loadIfNeeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StructuresActions.loadIfNeeded),
      withLatestFrom(this.store.select(selectAreStructuresLoaded)),
      filter(([, loaded]) => !loaded),
      map(() => StructuresActions.load())
    )
  );

  public readonly loadStructures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StructuresActions.load),
      switchMap(() =>
        this.adminStructuresApiClient.getAdminStructureListData().pipe(
          map((structures) =>
            StructuresActions.loadSuccess({ structures: structures ?? [] })
          ),
          catchError((error: { message?: string }) =>
            of(
              StructuresActions.loadFailure({
                error: error?.message ?? "UNKNOWN_ERROR",
              })
            )
          )
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {}
}
