import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FaConfig, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { AuthService } from "./services/auth.service";
import { HealthCheckService } from "./services/health-check.service";

@NgModule({
  declarations: [DigitOnlyDirective, DateFrDirective, CleanStrDirective],
  exports: [DigitOnlyDirective, DateFrDirective, CleanStrDirective],
  imports: [CommonModule],
  providers: [FaIconLibrary, FaConfig],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
