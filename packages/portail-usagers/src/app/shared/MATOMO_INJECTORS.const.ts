import { MatomoModule, MatomoRouterModule } from "ngx-matomo-client";
import { environment } from "../../environments/environment";

export const MATOMO_INJECTORS = [
  MatomoModule.forRoot({
    disabled: !environment.production,
    trackerUrl: environment.matomo.url,
    siteId: environment.matomo.siteId,
  }),
  MatomoRouterModule.forRoot(),
];
