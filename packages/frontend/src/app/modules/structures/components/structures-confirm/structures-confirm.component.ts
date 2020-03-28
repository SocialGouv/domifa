import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structures-confirm",
  styleUrls: ["./structures-confirm.component.css"],
  templateUrl: "./structures-confirm.component.html",
})
export class StructuresConfirmComponent implements OnInit {
  public title: string;

  public successDelete: boolean;
  public successConfirm: boolean;
  public error: boolean;

  constructor(
    private structureService: StructureService,
    private route: ActivatedRoute
  ) {
    this.title = "Inscription";
    this.successDelete = false;
    this.successConfirm = false;
    this.error = false;
  }

  public ngOnInit() {
    const token = this.route.snapshot.url[2].path;
    if (this.route.snapshot.url[1].path === "delete") {
      this.structureService.delete(token).subscribe(
        (structure) => {
          this.successDelete = true;
        },
        (error) => {
          this.error = true;
        }
      );
    } else if (this.route.snapshot.url[1].path === "confirm") {
      this.structureService.confirm(token).subscribe(
        (structure) => {
          this.successConfirm = true;
        },
        (error) => {
          this.error = true;
        }
      );
    }
  }
}
