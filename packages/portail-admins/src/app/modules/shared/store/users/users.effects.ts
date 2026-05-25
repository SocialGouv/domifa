import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of, switchMap } from "rxjs";

import { AdminUsersApiClient } from "../../services/api/admin-users-api-client.service";

import { UsersActions } from "./users.actions";

@Injectable()
export class UsersEffects {
  public readonly loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.load),
      switchMap(() =>
        this.adminUsersApiClient.getStructureUsers().pipe(
          map((users) => UsersActions.loadSuccess({ users })),
          catchError((error: { message?: string }) =>
            of(
              UsersActions.loadFailure({
                error: error?.message ?? "UNKNOWN_ERROR",
              })
            )
          )
        )
      )
    )
  );

  public readonly resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.resetPassword),
      mergeMap(({ email, userId }) =>
        this.adminUsersApiClient.resetPassword(email).pipe(
          // Refresh the list so temporaryTokens are up to date.
          switchMap(() => [
            UsersActions.resetPasswordSuccess({ userId }),
            UsersActions.load(),
          ]),
          catchError((error: { message?: string }) =>
            of(
              UsersActions.resetPasswordFailure({
                error: error?.message ?? "UNKNOWN_ERROR",
              })
            )
          )
        )
      )
    )
  );

  public readonly elevateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.elevateRole),
      mergeMap(({ uuid }) =>
        this.adminUsersApiClient.elevateUserRole(uuid).pipe(
          switchMap(() => [
            UsersActions.elevateRoleSuccess({ uuid }),
            UsersActions.load(),
          ]),
          catchError((error: { message?: string }) =>
            of(
              UsersActions.elevateRoleFailure({
                error: error?.message ?? "UNKNOWN_ERROR",
              })
            )
          )
        )
      )
    )
  );

  public readonly unblockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.unblockUser),
      mergeMap(({ structureUuid, userUuid }) =>
        this.adminUsersApiClient.unblockUser(structureUuid, userUuid).pipe(
          switchMap(() => [
            UsersActions.unblockUserSuccess({ userUuid }),
            UsersActions.load(),
          ]),
          catchError((error: { message?: string }) =>
            of(
              UsersActions.unblockUserFailure({
                error: error?.message ?? "UNKNOWN_ERROR",
              })
            )
          )
        )
      )
    )
  );

  public readonly blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.blockUser),
      mergeMap(({ structureUuid, userUuid }) =>
        this.adminUsersApiClient.blockUser(structureUuid, userUuid).pipe(
          switchMap(() => [
            UsersActions.blockUserSuccess({ userUuid }),
            UsersActions.load(),
          ]),
          catchError((error: { message?: string }) =>
            of(
              UsersActions.blockUserFailure({
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
    private readonly adminUsersApiClient: AdminUsersApiClient
  ) {}
}
