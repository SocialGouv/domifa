import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { SuspiciousActivityListComponent } from "./components/suspicious-activity-list/suspicious-activity-list.component";
import { SuspiciousActivityRoutingModule } from "./suspicious-activity-routing.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SuspiciousActivityRoutingModule,
    SuspiciousActivityListComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SuspiciousActivityModule {}
