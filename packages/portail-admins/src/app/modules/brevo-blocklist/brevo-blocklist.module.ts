import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { BrevoBlocklistComponent } from "./components/brevo-blocklist/brevo-blocklist.component";
import { BrevoBlocklistRoutingModule } from "./brevo-blocklist-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, BrevoBlocklistRoutingModule, BrevoBlocklistComponent],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class BrevoBlocklistModule {}
