import { Component, Input, OnInit, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { environment } from "../../../../../../environments/environment";

@Component({
  selector: "app-cgu",
  standalone: true,
  templateUrl: "./cgu.component.html",
})
export class CguComponent implements OnInit {
  @Input() public inModal = false;

  public portailUsagerUrl = environment.portailUsagersUrl;

  private readonly titleService = inject(Title);

  public ngOnInit(): void {
    if (!this.inModal) {
      this.titleService.setTitle(
        "Conditions générales d'utilisation de DomiFa"
      );
    }
  }
}
