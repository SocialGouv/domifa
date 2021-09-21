import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { JWT_INTERCEPTORS } from "./interceptors/jwt.interceptor";

@NgModule({
  declarations: [AppComponent],
  imports: [
    FontAwesomeModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [JWT_INTERCEPTORS],

  bootstrap: [AppComponent],
})
export class AppModule {
  constructo(library: FaIconLibrary) {
    library.addIcons(faEye);
  }
}
