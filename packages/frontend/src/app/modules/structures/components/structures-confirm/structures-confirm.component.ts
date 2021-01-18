import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
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

  constructor(
    private structureService: StructureService,
    private route: ActivatedRoute,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.successDelete = false;
    this.successConfirm = false;
    this.confirmDelete = false;
    this.error = false;
    this.errorDelete = false;

    this.nom = null;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa");
    const id = this.route.snapshot.url[2].path;
    const token = this.route.snapshot.url[3].path;
    if (this.route.snapshot.url[1].path === "delete") {
      this.structureService.deleteCheck(id, token).subscribe(
        (structure: StructureCommon) => {
          this.structure = structure;
          this.confirmDelete = true;
        },
        () => {
          this.error = true;
        }
      );
    } else if (this.route.snapshot.url[1].path === "confirm") {
      this.structureService.confirm(id, token).subscribe(
        (structure) => {
          this.structure = structure;
          this.successConfirm = true;
        },
        () => {
          this.error = true;
        }
      );
    }
  }

  public confirm() {
    const id = this.route.snapshot.url[2].path;
    const token = this.route.snapshot.url[3].path;

    this.structureService.delete(id, token, this.nom).subscribe(
      () => {
        this.successDelete = true;
        this.confirmDelete = false;
        this.notifService.success("Suppression réussie");
      },
      () => {
        this.notifService.error("Le nom saisi est incorrect");
      }
    );
  }
}
