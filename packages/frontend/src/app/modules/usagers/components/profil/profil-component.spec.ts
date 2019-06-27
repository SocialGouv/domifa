import { APP_BASE_HREF, Location } from "@angular/common";
import { async, fakeAsync, inject, TestBed, tick } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UsagersProfilComponent } from "./profil-component";

describe("UsagersProfilComponent", () => {
  let fixture: any;
  let app: any;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterModule.forRoot([])
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],

      declarations: [UsagersProfilComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsagersProfilComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(app).toBeTruthy();
  });

  it("1. Variable", () => {
    expect(app.title).toBeDefined();
    expect(app.labels).toBeDefined();
    expect(app.notifLabels).toBeDefined();

    expect(app.notifInputs).toEqual({
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0
    });

    expect(app.callToday).toBeFalsy();
    expect(app.visitToday).toBeFalsy();
  });

  it("4. Routing functions", fakeAsync(
    inject([Router, Location], (router: Router, location: Location) => {
      expect(location.path()).toEqual("/profil/2/edit");
    })
  ));
});
