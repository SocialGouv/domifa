import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";

import { ManageUsagersTableComponent } from "./components/manage-usagers-table/manage-usagers-table.component";
import { ManageUsagersPageComponent } from "./components/manage-usagers-page/manage-usagers-page.component";

import { ManageUsagersRoutingModule } from "./manage-usagers-routing.module";
import { ManageDownloadDocsComponent } from "./components/manage-download-docs/manage-download-docs.component";
import { ColumnInformationsComponent } from "./components/column-informations/column-informations.component";

import { ManageFiltersComponent } from "./components/manage-filters/manage-filters.component";
import { ColumnInteractionsComponent } from "./components/column-interactions/column-interactions.component";
import { FormatInternationalPhoneNumberPipe } from "../../shared/phone/formatInternationalPhoneNumber.pipe";
import { FullNamePipe } from "../usager-shared/pipes";
import { SortLabelPipe } from "./pipes/sort-label.pipe";
import { TableHeadSortIconComponent } from "../shared/components/table-head-sort-icon/table-head-sort-icon.component";
import { AssignReferrersComponent } from "./components/assign-referrers/assign-referrers.component";
import {
  StickySelectionBarDirective,
  DateFrConditionalDirective,
} from "./directives";

@NgModule({
  declarations: [
    ManageUsagersPageComponent,
    ManageUsagersTableComponent,
    ManageDownloadDocsComponent,
    ColumnInformationsComponent,
    ManageFiltersComponent,
    ColumnInteractionsComponent,
    SortLabelPipe,
    StickySelectionBarDirective,
    AssignReferrersComponent,
    DateFrConditionalDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    UsagerSharedModule,
    HttpClientModule,
    NgbModule,
    SharedModule,
    UsersModule,
    TableHeadSortIconComponent,
    ManageUsagersRoutingModule,
    FormatInternationalPhoneNumberPipe,
    FullNamePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ManageUsagersModule {}
