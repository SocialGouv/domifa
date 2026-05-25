import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription } from "rxjs";

import { PortailAdminUser, UserSupervisor } from "@domifa/common";

import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { ManageUsersService } from "../../services/manage-users.service";
import { RegisterUserSupervisorComponent } from "../register-user-supervisor/register-user-supervisor.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";

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
    private readonly manageUsersService: ManageUsersService,
    private readonly titleService: Title
  ) {}

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    const uuid = this.activatedRoute.snapshot.params["uuid"];

    this.subscription.add(
      this.manageUsersService.users$.subscribe((users) => {
        const found = users.find((u) => u.uuid === uuid);
        if (found) {
          this.supervisor = found;
          this.titleService.setTitle(
            `${found.nom} ${found.prenom} - Pilotage DomiFa`
          );
          this.loading = false;
        } else if (users.length > 0) {
          this.loading = false;
          this.router.navigate(["/manage-users"]);
        }
      })
    );

    this.manageUsersService.loadUsers();
  }

  public openEditModal(): void {
    this.updateUserModal.open();
  }

  public closeEditModal(): void {
    this.updateUserModal?.close();
    this.manageUsersService.loadUsers();
  }

  public onActionsRefresh(): void {
    this.manageUsersService.loadUsers();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
