import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription, take } from "rxjs";

import { StructureAdmin } from "@domifa/common";

import {
  selectAreStructuresLoaded,
  selectStructureByUuid,
  StructuresActions,
} from "../../../shared/store/structures";

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
  imports: [CommonModule, RouterModule, DsfrSpinnerComponent],
})
export class AdminStructureContainerComponent implements OnInit, OnDestroy {
  public structure?: StructureAdmin;
  public loading = true;
  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store
  ) {}

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
}
