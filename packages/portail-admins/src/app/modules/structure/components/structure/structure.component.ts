import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { StructureCommon } from "@domifa/common";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { StructureService } from "../../services/structure.service";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-structure",
  templateUrl: "./structure.component.html",
  styleUrl: "./structure.component.css",
})
export class StructureComponent implements OnInit {
  private readonly subscription = new Subscription();
  public searching = true;
  public structure: StructureCommon;
  public structureId: number;

  public section: "structure" | "users" | "stats" = "structure";
  public readonly faArrowLeft = faArrowLeft;

  constructor(
    private readonly structureService: StructureService,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.titleService.setTitle("Administration de la structure");
    this.structureId = this.route.snapshot.params.structureId as number;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.structureService.getStructure(this.structureId).subscribe({
        next: (structure) => {
          this.structure = structure;
          this.searching = false;
        },
        error: () => {
          this.searching = false;
          this.router.navigate(["/404"]);
        },
      })
    );
  }
}
