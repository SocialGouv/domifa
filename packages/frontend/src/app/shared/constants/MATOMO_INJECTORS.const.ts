import { NgxMatomoRouterModule } from "@ngx-matomo/router";
import { NgxMatomoTrackerModule } from "@ngx-matomo/tracker";
import { environment } from "../../../environments/environment";

export const MATOMO_INJECTORS = [
  NgxMatomoTrackerModule.forRoot({
    disabled: !environment.production,
    trackerUrl: environment.matomo.url,
    siteId: environment.matomo.siteId,
  }),
  NgxMatomoRouterModule,
];
