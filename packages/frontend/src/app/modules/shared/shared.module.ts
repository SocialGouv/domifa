import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FaConfig, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { DateFrDirective } from "./date-fr.directive";
import { DigitOnlyDirective } from "./digit-only.directive";
import { PrintService } from "./print.service";

@NgModule({
  declarations: [DigitOnlyDirective, DateFrDirective],
  exports: [DigitOnlyDirective, DateFrDirective],
  imports: [CommonModule],
  providers: [PrintService, FaIconLibrary, FaConfig],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
