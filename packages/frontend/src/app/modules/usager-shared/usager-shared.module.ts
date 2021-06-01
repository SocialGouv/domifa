import { InteractionService } from "./services/interaction.service";

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DocumentsComponent } from "./components/documents/documents.component";
import { UploadComponent } from "./components/upload/upload.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";

import { DocumentService } from "./services/document.service";

import { DeleteUsagerMenuComponent } from "./components/delete-usager-menu/delete-usager-menu.component";
import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { EntretienComponent } from "./components/entretien-form/entretien.component";

@NgModule({
  declarations: [
    DocumentsComponent,
    DeleteUsagerMenuComponent,
    UploadComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    ToastrModule.forRoot({}),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    UploadComponent,
    DocumentsComponent,
    DeleteUsagerMenuComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
  ],
  providers: [DocumentService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerSharedModule {}
