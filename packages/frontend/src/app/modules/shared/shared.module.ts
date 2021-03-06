import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FaConfig, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { UsagerNomCompletPipe } from "../../shared/usager-nom-complet.pipe";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";

@NgModule({
  declarations: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
  ],
  exports: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
  ],
  imports: [CommonModule],
  providers: [FaIconLibrary, FaConfig],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
