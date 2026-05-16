import { NgModule } from "@angular/core";

import { SeoService } from "./services/seo.service";
import { DsfrToastService } from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  providers: [SeoService, DsfrToastService],
})
export class SharedModule {}
