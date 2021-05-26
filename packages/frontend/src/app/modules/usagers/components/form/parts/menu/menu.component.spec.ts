import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MenuComponent } from "./menu.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ToastrModule } from "ngx-toastr";

describe("MenuComponent", () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          RouterTestingModule,
          NgbModule,
          ReactiveFormsModule,
          FormsModule,
          HttpClientModule,
          ToastrModule.forRoot(),
          BrowserAnimationsModule,
          HttpClientTestingModule,
        ],
        declarations: [MenuComponent],
      });
      fixture = TestBed.createComponent(MenuComponent);
      component = fixture.componentInstance;
    })
  );

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });

  it(`etapes has default value`, () => {
    expect(component.etapes).toEqual([
      `État civil`,
      `Prise de RDV`,
      `Entretien`,
      `Pièces justificatives`,
      `Décision finale`,
    ]);
  });

  it(`etapesUrl has default value`, () => {
    expect(component.etapesUrl).toEqual([
      `etat-civil`,
      `rendez-vous`,
      `entretien`,
      `documents`,
      `decision`,
    ]);
  });
});
