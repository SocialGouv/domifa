import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";

import { ToastrModule } from "ngx-toastr";
import { Usager } from "../../../interfaces/usager";

import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: any;
  let component: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilProcurationCourrierComponent],
      imports: [
        MatomoModule,
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      UsagersProfilProcurationCourrierComponent
    );
    component = fixture.debugElement.componentInstance;
    component.usager = new Usager();

    component.ngOnInit();
  });

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
