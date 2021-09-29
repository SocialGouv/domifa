import {
  FaIconLibrary,
  FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { UsagerNomCompletPipe } from "./pipes/usager-nom-complet.pipe";
import { CleanStrDirective } from "./directives/clean-str.directive";
import { DateFrDirective } from "./directives/date-fr.directive";
import { DigitOnlyDirective } from "./directives/digit-only.directive";
import { FormatPhoneNumberPipe } from "./pipes/formatPhoneNumber.pipe";
import { FormatBigNumberPipe } from "./pipes/formatBigNumber.pipe";
import {
  faArrowAltCircleRight,
  faChartBar,
  faClock,
  faEdit,
  faEye,
  faEyeSlash,
  faFileWord,
  faQuestionCircle,
} from "@fortawesome/free-regular-svg-icons";
import {
  faCheckCircle,
  faAngleLeft,
  faAngleRight,
  faArrowDown,
  faBan,
  faCalendar,
  faCheck,
  faCircleNotch,
  faDownload,
  faExclamationTriangle,
  faHome,
  faInfoCircle,
  faPencilAlt,
  faPlus,
  faPrint,
  faQuestion,
  faRedo,
  faSearch,
  faShare,
  faSignOutAlt,
  faSms,
  faSort,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faSync,
  faTimes,
  faTimesCircle,
  faTrash,
  faUpload,
  faUser,
  faUsers,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

@NgModule({
  declarations: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
  ],
  exports: [
    DigitOnlyDirective,
    DateFrDirective,
    CleanStrDirective,
    UsagerNomCompletPipe,
    FormatPhoneNumberPipe,
    FormatBigNumberPipe,
    FontAwesomeModule,
  ],
  imports: [CommonModule, FontAwesomeModule],
  providers: [],
})
export class SharedModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(
      faAngleLeft,
      faAngleRight,
      faArrowAltCircleRight,
      faArrowDown,
      faBan,
      faCalendar,
      faChartBar,
      faCheck,
      faCheckCircle,
      faCircleNotch,
      faClock,
      faDownload,
      faEdit,
      faExclamationTriangle,
      faEye,
      faEyeSlash,
      faFileWord,
      faHome,
      faInfoCircle,
      faPencilAlt,
      faPlus,
      faPrint,
      faQuestion,
      faQuestionCircle,
      faRedo,
      faSearch,
      faShare,
      faSignOutAlt,
      faSms,
      faSort,
      faSortAmountDown,
      faSortAmountUp,
      faSpinner,
      faSync,
      faTimes,
      faTimesCircle,
      faTrash,
      faUpload,
      faUser,
      faUsers,
      faUserShield
    );
  }
}
