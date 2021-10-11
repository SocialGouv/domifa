import { Component, Input, OnInit } from "@angular/core";
import { PortailUsagerPublic } from "../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../_common/mocks/DEFAULT_USAGER.const";

@Component({
  selector: "app-section-courriers",
  templateUrl: "./section-courriers.component.html",
  styleUrls: ["./section-courriers.component.css"],
})
export class SectionCourriersComponent implements OnInit {
  @Input() public usager: PortailUsagerPublic;

  constructor() {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
  }

  ngOnInit(): void {
    console.log("SectionCourriersComponent this.usager");
    console.log(this.usager);
  }
}
