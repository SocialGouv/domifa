import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Store } from "@ngrx/store";
import { combineLatest, Observable, Subscription } from "rxjs";

import { PortailAdminUser, UserSupervisor } from "@domifa/common";

import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { RegisterUserSupervisorComponent } from "../register-user-supervisor/register-user-supervisor.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";
import {
  selectAreSupervisorsLoaded,
  selectSupervisorByUuid,
  SupervisorsActions,
} from "../../../shared/store/supervisors";

@Component({
  selector: "app-supervisor-detail-container",
  templateUrl: "./supervisor-detail-container.component.html",
  imports: [
    CommonModule,
    RouterModule,
    DsfrModalModule,
    DsfrSpinnerComponent,
    RegisterUserSupervisorComponent,
    UserActionsComponent,
  ],
})
export class SupervisorDetailContainerComponent implements OnInit, OnDestroy {
  public supervisor?: UserSupervisor;
  public me!: PortailAdminUser | null;
  public loading = true;

  @ViewChild("updateUserModal")
  public updateUserModal!: DsfrModalComponent;

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AdminAuthService,
    private readonly store: Store,
    private readonly titleService: Title
  ) {}

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    const uuid = this.activatedRoute.snapshot.params["uuid"];

    const supervisor$: Observable<UserSupervisor | undefined> =
      this.store.select(selectSupervisorByUuid(uuid));
    const loaded$ = this.store.select(selectAreSupervisorsLoaded);

    this.subscription.add(
      combineLatest([supervisor$, loaded$]).subscribe(([found, loaded]) => {
        if (found) {
          this.supervisor = found;
          this.titleService.setTitle(
            `${found.nom} ${found.prenom} - Pilotage DomiFa`
          );
          this.loading = false;
        } else if (loaded) {
          this.loading = false;
          this.router.navigate(["/manage-users"]);
        }
      })
    );

    this.store.dispatch(SupervisorsActions.loadIfNeeded());
  }

  public openEditModal(): void {
    this.updateUserModal.open();
  }

  public closeEditModal(): void {
    this.updateUserModal?.close();
    this.store.dispatch(SupervisorsActions.load());
  }

  public onActionsRefresh(): void {
    this.store.dispatch(SupervisorsActions.load());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
