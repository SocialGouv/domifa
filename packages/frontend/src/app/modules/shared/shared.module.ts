import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DateFrDirective } from "./date-fr.directive";
import { DigitOnlyDirective } from "./digit-only.directive";

@NgModule({
  declarations: [DigitOnlyDirective, DateFrDirective],
  exports: [DigitOnlyDirective, DateFrDirective],
  imports: [CommonModule]
})
export class SharedModule {}
