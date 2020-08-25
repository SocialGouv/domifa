import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";

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
  public structure: Structure;

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
        (structure: Structure) => {
          this.structure = structure;
          this.confirmDelete = true;
        },
        (error) => {
          this.error = true;
        }
      );
    } else if (this.route.snapshot.url[1].path === "confirm") {
      this.structureService.confirm(id, token).subscribe(
        (structure) => {
          this.structure = structure;
          this.successConfirm = true;
        },
        (error) => {
          this.error = true;
        }
      );
    }
  }

  public confirm() {
    const id = this.route.snapshot.url[2].path;
    const token = this.route.snapshot.url[3].path;

    this.structureService.delete(id, token, this.nom).subscribe(
      (structure) => {
        this.successDelete = true;
        this.confirmDelete = false;
        this.notifService.success("Suppression réussie");
      },
      (error) => {
        this.notifService.error("Le nom saisi est incorrect");
      }
    );
  }
}
