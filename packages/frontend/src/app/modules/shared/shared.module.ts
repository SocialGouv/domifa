import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { DateFrDirective } from "./date-fr.directive";
import { DigitOnlyDirective } from "./digit-only.directive";
@NgModule({
  declarations: [DigitOnlyDirective, DateFrDirective],
  exports: [DigitOnlyDirective, DateFrDirective],
  imports: [CommonModule]
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
