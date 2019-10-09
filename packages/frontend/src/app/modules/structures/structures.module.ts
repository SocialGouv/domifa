import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPrintModule } from "ngx-print";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { StructuresConfirmComponent } from "./components/structures-confirm/structures-confirm.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";

@NgModule({
  declarations: [
    StructuresConfirmComponent,
    StructuresSearchComponent,
    StructuresFormComponent
  ],
  exports: [
    StructuresConfirmComponent,
    StructuresSearchComponent,
    StructuresFormComponent
  ],
  imports: [
    UsersModule,
    CommonModule,
    BrowserModule,
    NgxPrintModule,
    SharedModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 2000
    }),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class StructuresModule {}
