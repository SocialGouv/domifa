import { DsfrAlertComponent, DsfrFooterModule } from "@edugouvfr/ngx-dsfr";
import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";

import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";

import { AriaHideEmojiPipe, FullNamePipe, ReplaceLineBreaks } from "./pipes";
import { CleanStrDirective } from "./directives";
import { ButtonComponent } from "./components/button/button.component";
import { InputReferrerComponent } from "./components/input-referrer/input-referrer.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FonctionSelectionComponent } from "./components/fonction-selection/fonction-selection.component";
import { FonctionFormatPipe } from "./pipes/fonction-format.pipe";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
  DsfrTimelineComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { HasRoleDirective } from "./directives/has-role.directive";
import { AlerteConfidentialiteComponent } from "../general/components/navbar/fragments/alerte-confidentialite/alerte-confidentialite.component";
import { UserStructurePasswordFormComponent } from "./components/user-structure-password-form/user-structure-password-form.component";
import { LoadingComponent } from "./components/loading/loading.component";
import { SupportModeDisableDirective } from "./directives/support-mode-disable.directive";
import { GenericEmailAcknowledgementComponent } from "./components/generic-email-acknowledgement/generic-email-acknowledgement.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FullNamePipe,
    FonctionFormatPipe,
    DsfrFooterModule,
    HasRoleDirective,
    DsfrDropdownMenuComponent,
    AlerteConfidentialiteComponent,
    DsfrTimelineComponent,
    DsfrDropdownMenuItemComponent,
    LoadingComponent,
    DsfrAlertComponent,
    SupportModeDisableDirective,
  ],
  declarations: [
    CleanStrDirective,
    CustomToastrComponent,
    AriaHideEmojiPipe,
    ReplaceLineBreaks,
    ButtonComponent,
    InputReferrerComponent,
    FonctionSelectionComponent,
    UserStructurePasswordFormComponent,
    GenericEmailAcknowledgementComponent,
  ],
  exports: [
    AriaHideEmojiPipe,
    ReplaceLineBreaks,
    InputReferrerComponent,
    FonctionSelectionComponent,
    CleanStrDirective,
    HasRoleDirective,
    CustomToastrComponent,
    ButtonComponent,
    FonctionFormatPipe,
    DsfrFooterModule,
    DsfrDropdownMenuComponent,
    AlerteConfidentialiteComponent,
    UserStructurePasswordFormComponent,
    GenericEmailAcknowledgementComponent,
    DsfrTimelineComponent,
    DsfrDropdownMenuItemComponent,
    SupportModeDisableDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
