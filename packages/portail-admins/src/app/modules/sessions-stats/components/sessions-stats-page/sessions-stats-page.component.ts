import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { SessionsStatsTilesComponent } from "../../../shared/components/sessions-stats-tiles/sessions-stats-tiles.component";

@Component({
  selector: "app-sessions-stats-page",
  templateUrl: "./sessions-stats-page.component.html",
  imports: [CommonModule, SessionsStatsTilesComponent],
})
export class SessionsStatsPageComponent {}
