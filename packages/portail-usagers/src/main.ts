import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

import * as Sentry from "@sentry/angular";
import pkg from "../package.json";

if (environment.production) {
  Sentry.init({
    release: "domifa@" + pkg.version,
    dsn: "https://904877ea9ec4454aa1be7b629a6ea340@sentry.fabrique.social.gouv.fr/58",
    environment: environment.env,
    tracesSampleRate: 1.0,
  });

  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  /* tslint:disable */ .catch((err) => console.error(err)); /* tslint:enable */
