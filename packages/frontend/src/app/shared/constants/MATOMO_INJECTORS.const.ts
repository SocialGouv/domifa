import { NgxMatomoModule, NgxMatomoRouterModule } from "ngx-matomo-client";
import { environment } from "../../../environments/environment";
import { MatomoInterceptor } from "../../interceptors/matomo.interceptor";

export const MATOMO_INJECTORS = [
  NgxMatomoModule.forRoot({
    disabled: !environment.production,
    trackerUrl: environment.matomo.url,
    siteId: environment.matomo.siteId,
  }),
  NgxMatomoRouterModule.forRoot({
    interceptors: [MatomoInterceptor],
  }),
];
