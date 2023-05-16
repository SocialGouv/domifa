import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseUsagerNotesComponent } from "./components/base-usager-notes/base-usager-notes.component";
import { ProfilAddNoteFormComponent } from "./components/profil-add-note-form/profil-add-note-form.component";
import { ProfilGeneralNotesComponent } from "./components/profil-general-notes/profil-general-notes.component";
import { ProfilHistoriqueNotesComponent } from "./components/profil-historique-notes/profil-historique-notes.component";
import { UsagerNotesActionsComponent } from "./components/usager-notes-actions/usager-notes-actions.component";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    BaseUsagerNotesComponent,
    ProfilGeneralNotesComponent,
    ProfilHistoriqueNotesComponent,
    ProfilAddNoteFormComponent,
    UsagerNotesActionsComponent,
  ],
  exports: [
    ProfilGeneralNotesComponent,
    ProfilHistoriqueNotesComponent,
    ProfilAddNoteFormComponent,
    UsagerNotesActionsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [CommonModule, NgbModule, SharedModule],
})
export class UsagerNotesModule {}
