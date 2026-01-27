import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseUsagerNotesComponent } from "./components/base-usager-notes/base-usager-notes.component";
import { ProfilAddNoteFormComponent } from "./components/profil-add-note-form/profil-add-note-form.component";
import { ProfilGeneralNotesComponent } from "./components/profil-general-notes/profil-general-notes.component";
import { UsagerNotesActionsComponent } from "./components/usager-notes-actions/usager-notes-actions.component";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";
import { FullNamePipe } from "../shared/pipes";
import { DsfrButtonComponent, DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { DsfrDropdownMenuComponent } from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  declarations: [
    BaseUsagerNotesComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
    UsagerNotesActionsComponent,
  ],
  exports: [
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
    UsagerNotesActionsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    UsagerSharedModule,
    FullNamePipe,
    DsfrModalComponent,
    DsfrDropdownMenuComponent,
    DsfrButtonComponent,
  ],
})
export class UsagerNotesModule {}
