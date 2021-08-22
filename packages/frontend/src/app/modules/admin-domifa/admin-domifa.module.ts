import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AdminDomifaRoutingModule } from "./admin-domifa-routing.module";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { AdminDomifaService } from "./services/admin-domifa.service";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    AdminDomifaRoutingModule,
    NgbModule,
    SharedModule,
    FontAwesomeModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [AdminDomifaService],
})
export class AdminDomifaModule {}
