import { Component, OnInit } from "@angular/core";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structures-search",
  styleUrls: ["./structures-search.component.css"],
  templateUrl: "./structures-search.component.html"
})
export class StructuresSearchComponent implements OnInit {
  public structures: Structure[];

  constructor(private structureService: StructureService) {}
  public ngOnInit() {
    this.structureService.getAll().subscribe((structures: Structure[]) => {
      this.structures = structures;
    });
  }
}
