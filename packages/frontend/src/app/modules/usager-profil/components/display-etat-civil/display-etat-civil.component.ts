import { OnInit, Component, Input } from "@angular/core";
import { LIEN_PARENTE_LABELS, UsagerLight } from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";

@Component({
  selector: "app-display-etat-civil",
  templateUrl: "./display-etat-civil.component.html",
})
export class DisplayEtatCivilComponent implements OnInit {
  @Input() public usager: UsagerLight;

  public languagesAutocomplete = languagesAutocomplete;
  public LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  constructor() {}

  public ngOnInit(): void {}
}
