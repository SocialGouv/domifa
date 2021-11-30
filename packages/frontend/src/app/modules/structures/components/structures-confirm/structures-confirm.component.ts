import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { StructureCommon } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-confirm",
  styleUrls: ["./structures-confirm.component.css"],
  templateUrl: "./structures-confirm.component.html",
})
export class StructuresConfirmComponent implements OnInit {
  public successDelete: boolean;
  public confirmDelete: boolean;

  public successConfirm: boolean;

  public error: boolean;
  public errorDelete: boolean;

  public nom: string;
  public structure: StructureCommon;

  public structureId: string;
  public token: string;

  constructor(
    private structureService: StructureService,
    private route: ActivatedRoute,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.successDelete = false;
    this.successConfirm = false;
    this.confirmDelete = false;
    this.error = false;
    this.errorDelete = false;
    this.nom = null;

    this.structureId = null;
    this.token = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription sur Domifa");

    this.structureId = this.route.snapshot.url[1].path;
    this.token = this.route.snapshot.url[2].path;

    if (this.route.snapshot.url[0].path === "delete") {
      this.structureService
        .deleteCheck(this.structureId, this.token)
        .subscribe({
          next: (structure: StructureCommon) => {
            this.structure = structure;
            this.confirmDelete = true;
          },
          error: () => {
            this.error = true;
          },
        });
    } else if (this.route.snapshot.url[0].path === "confirm") {
      this.structureService.confirm(this.structureId, this.token).subscribe({
        next: (structure) => {
          this.structure = structure;
          this.successConfirm = true;
        },
        error: () => {
          this.error = true;
        },
      });
    } else {
      this.notifService.error(
        "Le lien semble incorrect, veuillez vérifier vos emails"
      );
      this.router.navigate(["/404"]);
      return;
    }
  }

  public confirm() {
    this.structureService
      .delete(this.structureId, this.token, this.nom)
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
  }
}
