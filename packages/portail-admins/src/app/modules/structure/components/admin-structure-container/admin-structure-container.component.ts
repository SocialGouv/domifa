import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  DsfrButtonModule,
  DsfrButtonsGroupModule,
  DsfrModalComponent,
  DsfrModalModule,
} from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription, take } from "rxjs";

import { StructureAdmin } from "@domifa/common";

import {
  selectAreStructuresLoaded,
  selectStructureByUuid,
  StructuresActions,
} from "../../../shared/store/structures";
import { StructureService } from "../../services/structure.service";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { CustomToastService } from "../../../shared/services";

const SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN = "@fabrique.social.gouv.fr";

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
  imports: [
    CommonModule,
    RouterModule,
    DsfrSpinnerComponent,
    DsfrModalModule,
    DsfrButtonModule,
    DsfrButtonsGroupModule,
  ],
})
export class AdminStructureContainerComponent implements OnInit, OnDestroy {
  public structure?: StructureAdmin;
  public loading = true;
  public activatingSupportSession = false;
  private readonly subscription = new Subscription();

  @ViewChild("supportSessionModal")
  public supportSessionModal!: DsfrModalComponent;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store,
    private readonly structureService: StructureService,
    private readonly adminAuthService: AdminAuthService,
    private readonly toastr: CustomToastService
  ) {}

  public get canUseSupportMode(): boolean {
    return (
      this.adminAuthService.currentUserValue?.email
        ?.toLowerCase()
        .endsWith(SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN) ?? false
    );
  }

  ngOnInit(): void {
    const structureUuid = this.activatedRoute.snapshot.params["structureUuid"];

    this.store
      .select(selectAreStructuresLoaded)
      .pipe(take(1))
      .subscribe((loaded) => {
        if (!loaded) {
          this.store.dispatch(StructuresActions.load());
        }
      });

    this.subscription.add(
      this.store.select(selectStructureByUuid(structureUuid)).subscribe({
        next: (structure) => {
          this.structure = structure;
          this.loading = false;

          if (!structure) {
            this.store
              .select(selectAreStructuresLoaded)
              .pipe(take(1))
              .subscribe((loaded) => {
                if (loaded) {
                  this.router.navigate(["/404"]);
                }
              });
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openSupportSessionModal(): void {
    this.supportSessionModal.open();
  }

  public activateSupportSession(): void {
    if (!this.structure || this.activatingSupportSession) {
      return;
    }
    this.activatingSupportSession = true;
    this.structureService
      .activateSupportSession(this.structure.uuid)
      .subscribe({
        next: (response) => {
          this.activatingSupportSession = false;
          this.supportSessionModal.close();
          const until = new Date(response.expiresAt).toLocaleTimeString(
            "fr-FR",
            { hour: "2-digit", minute: "2-digit" }
          );
          this.toastr.success(
            `Compte support rattaché à ${response.structureNom} jusqu'à ${until}. ` +
              `Il peut maintenant se connecter normalement sur l'application structure.`
          );
        },
        error: () => {
          this.activatingSupportSession = false;
          this.toastr.error("Impossible de rattacher le compte support");
        },
      });
  }
}
