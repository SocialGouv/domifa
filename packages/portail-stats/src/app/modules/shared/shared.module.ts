import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DsfrAlertModule } from "@edugouvfr/ngx-dsfr";

import { ButtonComponent } from "./components/button/button.component";
import { CustomToastrComponent } from "./components/custom-toastr/custom-toastr.component";
import { UcFirstPipe } from "./pipes";

@NgModule({
  declarations: [],
  exports: [UcFirstPipe, CustomToastrComponent, ButtonComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DsfrAlertModule,
    UcFirstPipe,
    CustomToastrComponent,
    ButtonComponent,
  ],
})
export class SharedModule {}
