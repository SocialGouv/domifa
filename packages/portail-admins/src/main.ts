import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

import pkg from "../package.json";
import { init } from "@sentry/angular";

if (environment.production) {
  init({
    release: "domifa@" + pkg.version,
    dsn: "${DOMIFA_SENTRY_DSN_FRONTEND}",
    environment: environment.env,
    tracesSampleRate: 1.0,
  });

  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  /* tslint:disable */ .catch((err) => console.error(err)); /* tslint:enable */
