import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-structures-confirm",
  styleUrls: ["./structures-confirm.component.css"],
  templateUrl: "./structures-confirm.component.html",
})
export class StructuresConfirmComponent implements OnInit {
  public successDelete: boolean;
  public successConfirm: boolean;
  public error: boolean;

  constructor(
    private structureService: StructureService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.successDelete = false;
    this.successConfirm = false;
    this.error = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa");
    const id = this.route.snapshot.url[2].path;
    const token = this.route.snapshot.url[3].path;
    if (this.route.snapshot.url[1].path === "delete") {
      this.structureService.delete(id, token).subscribe(
        (structure) => {
          this.successDelete = true;
        },
        (error) => {
          this.error = true;
        }
      );
    } else if (this.route.snapshot.url[1].path === "confirm") {
      this.structureService.confirm(id, token).subscribe(
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
