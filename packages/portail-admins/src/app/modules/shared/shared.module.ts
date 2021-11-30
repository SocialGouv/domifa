import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { ToastrModule } from "ngx-toastr";
import { AdminStructuresExportComponent } from "../general/components/admin-structures-export";
import { FA_ICONS } from "./constants/FA_ICONS.const";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";
import { AdminNomCompletPipe } from "./pipes/admin-nom-complet.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import {
  AdminStructuresApiClient,
  AdminStructuresExportApiClient,
} from "./services";
import { AdminStructuresDeleteApiClient } from "./services/api/admin-structures-delete-api-client.service";

@NgModule({
  declarations: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
  ],
  exports: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    AdminNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    AdminStructuresExportComponent,
    FontAwesomeModule,
    ToastrModule,
  ],
  imports: [CommonModule, FontAwesomeModule, ToastrModule],
  providers: [
    AdminStructuresExportApiClient,
    AdminStructuresApiClient,
    AdminStructuresDeleteApiClient,
  ],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(...FA_ICONS);
  }
}
