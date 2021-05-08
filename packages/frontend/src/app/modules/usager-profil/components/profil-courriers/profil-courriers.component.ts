import { Component, Input, OnInit } from "@angular/core";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
  styleUrls: ["./profil-courriers.component.css"],
})
export class ProfilCourriersComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  constructor() {}

  ngOnInit(): void {}
}
