import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { RegisterUserComponent } from "./components/register-user/register-user.component";
import { StructureEditFormComponent } from "./components/structure-edit-form/structure-edit-form.component";
import { StructuresCustomDocsTableComponent } from "./components/structures-custom-docs-table/structures-custom-docs-table.component";
import { StructuresCustomDocsComponent } from "./components/structures-custom-docs/structures-custom-docs.component";
import { StructuresEditComponent } from "./components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./components/structures-sms-form/structures-sms-form.component";
import { StructuresUploadDocsComponent } from "./components/structures-upload-docs/structures-upload-docs.component";

import { StructuresRoutingModule } from "./structures-routing.module";
import { GeneralModule } from "../general/general.module";
import { SortArrayPipe } from "../shared/pipes";
import { DisplayTableImageComponent } from "../shared/components/display-table-image/display-table-image.component";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { DigitOnlyDirective } from "../shared/directives";
import { PhoneInputComponent } from "../usager-shared/components/input-phone-international/input-phone-international.component";

@NgModule({
  declarations: [
    StructuresSearchComponent,
    StructuresFormComponent,
    StructuresEditComponent,
    StructureEditFormComponent,
    StructuresUploadDocsComponent,
    StructuresSmsFormComponent,
    RegisterUserComponent,
    StructuresCustomDocsComponent,
    StructuresCustomDocsTableComponent,
  ],
  exports: [StructuresFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    UsersModule,
    NgxIntlTelInputModule,
    GeneralModule,
    StructuresRoutingModule,
    SortArrayPipe,
    DisplayTableImageComponent,
    TableHeadSortComponent,
    DigitOnlyDirective,
    PhoneInputComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class StructuresModule {}
