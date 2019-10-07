import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structures-confirm",
  styleUrls: ["./structures-confirm.component.css"],
  templateUrl: "./structures-confirm.component.html"
})
export class StructuresConfirmComponent implements OnInit {
  public title: string;
  public token: string;
  public structure: Structure;
  public successDelete: boolean;
  public successConfirm: boolean;
  public error: boolean;

  constructor(
    private structureService: StructureService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.title = "Inscription";
    this.token = this.route.snapshot.params.token;

    this.successDelete = false;
    this.successConfirm = false;

    this.error = false;

    if (this.route.snapshot.url[1].path === "delete") {
      this.structureService.delete(this.token).subscribe(
        structure => {
          this.successDelete = true;
        },
        error => {
          this.error = true;
        }
      );
    } else if (this.route.snapshot.url[1].path === "confirm") {
      this.structureService.confirm(this.token).subscribe(
        structure => {
          this.successConfirm = true;
          this.structure = structure;
        },
        error => {
          this.error = true;
        }
      );
    }
  }
}
