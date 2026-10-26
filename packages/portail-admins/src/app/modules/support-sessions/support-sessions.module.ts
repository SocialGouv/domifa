import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { SupportSessionsListComponent } from "./components/support-sessions-list/support-sessions-list.component";
import { SupportSessionsRoutingModule } from "./support-sessions-routing.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SupportSessionsRoutingModule,
    SupportSessionsListComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SupportSessionsModule {}
