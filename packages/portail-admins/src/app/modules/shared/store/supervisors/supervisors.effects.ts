import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { catchError, filter, map, of, switchMap, withLatestFrom } from "rxjs";

import { AdminUsersApiClient } from "../../services/api/admin-users-api-client.service";

import { SupervisorsActions } from "./supervisors.actions";
import { selectAreSupervisorsLoaded } from "./supervisors.selectors";

@Injectable()
export class SupervisorsEffects {
  public readonly loadIfNeeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SupervisorsActions.loadIfNeeded),
      withLatestFrom(this.store.select(selectAreSupervisorsLoaded)),
      filter(([, loaded]) => !loaded),
      map(() => SupervisorsActions.load())
    )
  );

  public readonly loadSupervisors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SupervisorsActions.load),
      switchMap(() =>
        this.adminUsersApiClient.getSupervisors().pipe(
          map((supervisors) => SupervisorsActions.loadSuccess({ supervisors })),
          catchError((error: { message?: string }) =>
            of(
              SupervisorsActions.loadFailure({
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
    private readonly adminUsersApiClient: AdminUsersApiClient
  ) {}
}
