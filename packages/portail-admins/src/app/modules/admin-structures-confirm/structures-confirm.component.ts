import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { StructureAdmin } from "../../../_common";
import { AdminStructuresApiClient } from "../shared/services";
import { AdminStructuresDeleteApiClient } from "../shared/services/api/admin-structures-delete-api-client.service";

@Component({
  selector: "app-structures-confirm",
  styleUrls: ["./structures-confirm.component.css"],
  templateUrl: "./structures-confirm.component.html",
})
export class StructuresConfirmComponent implements OnInit {
  public successDelete: boolean;
  public confirmDelete: boolean;

  public successEnable: boolean;

  public error: boolean;
  public errorDelete: boolean;

  public structureConfirmName?: string;
  public structure?: StructureAdmin;

  private structureId!: number;
  private token!: string;

  public type?: "enable" | "delete";

  constructor(
    private adminStructuresApiClient: AdminStructuresApiClient,
    private adminStructuresDeleteApiClient: AdminStructuresDeleteApiClient,
    private route: ActivatedRoute,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.successDelete = false;
    this.successEnable = false;
    this.confirmDelete = false;
    this.error = false;
    this.errorDelete = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription sur Domifa");

    this.type = this.route.snapshot.data.type;

    // TODO
    //this.type = ... from route data

    // TODO: from route params
    this.structureId = parseInt(this.route.snapshot.params.structureId, 10);
    this.token = this.route.snapshot.params.token;
    if (this.type === "delete") {
      this.adminStructuresDeleteApiClient
        .deleteCheck(this.structureId, this.token)
        .subscribe({
          next: (structure: StructureAdmin) => {
            this.structure = structure;
            this.confirmDelete = true;
          },
          error: () => {
            this.error = true;
          },
        });
    } else if (this.type === "enable") {
      this.adminStructuresApiClient
        .confirmNewStructure(this.structureId, this.token)
        .subscribe({
          next: (structure: StructureAdmin) => {
            this.structure = structure;
            this.successEnable = true;
          },
          error: () => {
            this.error = true;
          },
        });
    }
  }

  public confirm() {
    if (
      !!this.structureConfirmName &&
      this.structureConfirmName.trim().length !== 0
    ) {
      this.adminStructuresDeleteApiClient
        .deleteConfirm(this.structureId, this.token, this.structureConfirmName)
        .subscribe({
          next: () => {
            this.successDelete = true;
            this.confirmDelete = false;
            this.notifService.success("Suppression réussie");
          },
          error: () => {
            this.notifService.error("Le nom saisi est incorrect");
          },
        });
    } else {
      this.notifService.error("Veuillez renseigner le nom de la structure");
    }
  }
}
