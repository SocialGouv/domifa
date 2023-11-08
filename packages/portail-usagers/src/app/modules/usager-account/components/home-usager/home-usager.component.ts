import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { PortailUsagerProfile } from "../../../../../_common";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";

@Component({
  selector: "app-home-usager",
  templateUrl: "./home-usager.component.html",
  styleUrls: ["./home-usager.component.css"],
})
export class HomeUsagerComponent implements OnInit {
  public usagerProfile!: PortailUsagerProfile | null;

  constructor(
    private readonly usagerAuthService: UsagerAuthService,
    private readonly titleService: Title,
  ) {
    this.usagerProfile = null;
    this.titleService.setTitle("Mon DomiFa");
  }

  public ngOnInit(): void {
    this.usagerAuthService.currentUsagerSubject.subscribe(
      (apiResponse: PortailUsagerProfile | null) => {
        this.usagerProfile = apiResponse;
      },
    );

    this.loadTallyScript();
  }

  private loadTallyScript(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tally: any = window["Tally" as unknown as any];
    if (tally) {
      tally.openPopup("n0B5MA", {
        layout: "popup",
        overlay: true,
        emoji: {
          text: "👋",
          animation: "wave",
        },
        doNotShowAfterSubmit: true,
      });
    }
  }
}
