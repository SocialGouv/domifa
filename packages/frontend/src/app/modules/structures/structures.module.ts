import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { StructureEditFormComponent } from "./components/structure-edit-form/structure-edit-form.component";
import { StructuresCustomDocsTableComponent } from "./components/structures-custom-docs-table/structures-custom-docs-table.component";
import { StructuresCustomDocsComponent } from "./components/structures-custom-docs/structures-custom-docs.component";
import { StructuresEditComponent } from "./components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresPortailUsagerFormComponent } from "./components/structures-portail-usager-form/structures-portail-usager-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./components/structures-sms-form/structures-sms-form.component";
import { StructuresUploadDocsComponent } from "./components/structures-upload-docs/structures-upload-docs.component";
import { StructuresRoutingModule } from "./structures-routing.module";

@NgModule({
  declarations: [
    StructuresSearchComponent,
    StructuresFormComponent,
    StructuresEditComponent,
    StructureEditFormComponent,
    StructuresUploadDocsComponent,
    StructuresSmsFormComponent,
    StructuresPortailUsagerFormComponent,
    RegisterUserComponent,
    StructuresCustomDocsComponent,
    StructuresCustomDocsTableComponent,
  ],
  exports: [StructuresSearchComponent, StructuresFormComponent],
  imports: [
    CommonModule,
    UsersModule,
    SharedModule,
    StructuresRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StructuresModule {}
