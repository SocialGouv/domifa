import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminStructuresApiClient } from "../shared/services";
import { Subscription } from "rxjs";
import { isHexadecimal, isUUID } from "class-validator";
import {} from "../admin-structures/types";
import { CustomToastService } from "../shared/services/custom-toast.service";
import { Structure } from "@domifa/common";

@Component({
  selector: "app-structures-confirm",
  templateUrl: "./structures-confirm.component.html",
})
export class StructuresConfirmComponent implements OnInit, OnDestroy {
  public successDelete: boolean;
  public confirmDelete: boolean;

  public successEnable: boolean;

  public error: boolean;
  public errorDelete: boolean;
  public loading: boolean;

  public structureName: string | null;
  public structure?: Structure;
  private structureUuid!: string;
  private token!: string;

  public type?: "enable" | "delete";
  private subscription = new Subscription();

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notifService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.structureName = null;
    this.successDelete = false;
    this.successEnable = false;
    this.confirmDelete = false;
    this.error = false;
    this.loading = false;
    this.errorDelete = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription sur Domifa");

    this.type = this.route.snapshot.data.type;

    if (
      isUUID(this.route.snapshot.params.structureUuid) &&
      isHexadecimal(this.route.snapshot.params.token)
    ) {
      this.structureUuid = this.route.snapshot.params.structureUuid;
      this.token = this.route.snapshot.params.token;
    } else {
      this.router.navigate(["404"]);
      return;
    }

    if (this.type === "delete") {
      this.subscription.add(
        this.adminStructuresApiClient
          .deleteCheck(this.structureUuid, this.token)
          .subscribe({
            next: (structure: Structure) => {
              this.structure = structure;
              this.confirmDelete = true;
            },
            error: () => {
              this.error = true;
            },
          })
      );
    } else if (this.type === "enable") {
      this.subscription.add(
        this.adminStructuresApiClient
          .confirmNewStructure(this.structureUuid, this.token)
          .subscribe({
            next: (structure: Structure) => {
              this.structure = structure;
              this.successEnable = true;
            },
            error: () => {
              this.error = true;
            },
          })
      );
    } else {
      this.router.navigate(["404"]);
      return;
    }
  }

  public confirm() {
    if (
      !!this.structureName &&
      this.structureName.trim().length !== 0 &&
      this.structureName === this.structure?.nom
    ) {
      this.loading = true;
      this.subscription.add(
        this.adminStructuresApiClient
          .deleteConfirm({
            token: this.token,
            uuid: this.structureUuid,
          })
          .subscribe({
            next: () => {
              this.successDelete = true;
              this.confirmDelete = false;
              this.notifService.success("Suppression réussie");
              this.loading = false;
            },
            error: () => {
              this.loading = false;
              this.notifService.error("Le nom saisi est incorrect");
            },
          })
      );
    } else {
      this.notifService.error("Veuillez vérifier le nom de la structure");
    }
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
