import { Component, OnInit } from "@angular/core";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structures-search",
  templateUrl: "./structures-search.component.html",
  styleUrls: ["./structures-search.component.css"]
})
export class StructuresSearchComponent implements OnInit {
  public structures: Structure[];

  constructor(private structureService: StructureService) {}
  public ngOnInit() {
    this.structureService.getAll().subscribe(
      (structures: Structure[]) => {
        this.structures = structures;
      },
      error => {
        console.log(error);
      }
    );
  }
}
