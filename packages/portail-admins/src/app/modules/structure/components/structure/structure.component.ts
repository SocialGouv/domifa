import { Component, OnInit } from "@angular/core";
import { AdminStructuresApiClient } from "../../../shared/services";
import { Title } from "@angular/platform-browser";
import { Structure } from "@domifa/common";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { isUUID } from "class-validator";

@Component({
  selector: "app-structure",

  templateUrl: "./structure.component.html",
  styleUrl: "./structure.component.css",
})
export class StructureComponent implements OnInit {
  private subscription = new Subscription();
  public searching = true;
  public structure: Structure;
  public structureUuid: string;
  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.titleService.setTitle("Administration de la structure");

    if (isUUID(this.route.snapshot.params.structureUuid)) {
      this.structureUuid = this.route.snapshot.params.structureUuid;
    } else {
      this.router.navigate(["404"]);
    }
  }

  ngOnInit(): void {
    this.subscription.add(
      this.adminStructuresApiClient
        .getStructure(this.structureUuid)
        .subscribe((structure) => {
          this.structure = structure;
          this.searching = false;
        })
    );
  }
}
