import { DEFAULT_USAGER } from "./../../../../_common/mocks/DEFAULT_USAGER.const";
import { UsagerPublic } from "./../../../../_common/usager/UsagerPublic.type";
import { Component, OnInit } from "@angular/core";
import { USAGER_DECISION_STATUT_LABELS } from "../../../../_common/usager/constants";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrls: ["./section-infos.component.css"],
})
export class SectionInfosComponent implements OnInit {
  public usager: UsagerPublic | null;
  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;
  constructor() {
    this.usager = DEFAULT_USAGER;
  }

  ngOnInit(): void {}
}
