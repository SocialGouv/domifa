import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { SessionsStatsPageComponent } from "./components/sessions-stats-page/sessions-stats-page.component";
import { SessionsStatsRoutingModule } from "./sessions-stats-routing.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SessionsStatsRoutingModule,
    SessionsStatsPageComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SessionsStatsModule {}
