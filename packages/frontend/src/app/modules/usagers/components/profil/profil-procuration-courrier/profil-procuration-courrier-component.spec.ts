import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ToastrModule } from "ngx-toastr";

import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: any;
  let component: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilProcurationCourrierComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(
      UsagersProfilProcurationCourrierComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
