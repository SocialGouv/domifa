import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";

import { AdminStructuresApiClient } from "../../services/api/admin-structures-api-client.service";

import { StructuresActions } from "./structures.actions";

@Injectable()
export class StructuresEffects {
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
    private readonly adminStructuresApiClient: AdminStructuresApiClient
  ) {}
}
