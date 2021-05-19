import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { StructureEditFormComponent } from "./components/structure-edit-form/structure-edit-form.component";
import { StructuresConfirmComponent } from "./components/structures-confirm/structures-confirm.component";
import { StructuresEditComponent } from "./components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./components/structures-sms-form/structures-sms-form.component";
import { StructuresUploadDocsComponent } from "./components/structures-upload-docs/structures-upload-docs.component";

import { StructureDocService } from "./services/structure-doc.service";
import { StructureService } from "./services/structure.service";

@NgModule({
  declarations: [
    StructuresConfirmComponent,
    StructuresSearchComponent,
    StructuresFormComponent,
    StructuresEditComponent,
    StructureEditFormComponent,
    StructuresUploadDocsComponent,
    StructuresConfirmComponent,
    StructuresSmsFormComponent,
    RegisterUserComponent,
  ],
  exports: [
    StructuresConfirmComponent,
    StructuresSearchComponent,
    StructuresFormComponent,
  ],
  imports: [
    UsersModule,
    CommonModule,
    SharedModule,
    FontAwesomeModule,
    RouterModule.forRoot([], { relativeLinkResolution: "legacy" }),
    ToastrModule.forRoot({}),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [StructureService, StructureDocService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StructuresModule {}
