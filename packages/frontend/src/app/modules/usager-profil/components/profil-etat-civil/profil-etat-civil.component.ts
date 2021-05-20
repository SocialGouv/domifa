import { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { UsagerLight } from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";

@Component({
  selector: "app-profil-etat-civil",
  templateUrl: "./profil-etat-civil.component.html",
  styleUrls: ["./profil-etat-civil.component.css"],
})
export class ProfilEtatCivilComponent implements OnInit {
  @Input() public usager: UsagerLight;

  public languagesAutocomplete = languagesAutocomplete;

  public ngOnInit() {}
  constructor() {}
}
