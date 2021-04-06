import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { RegisterUserComponent } from "./register-user.component";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("RegisterUserComponent", () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot({
          enableHtml: true,
          positionClass: "toast-top-full-width",
          preventDuplicates: true,
          progressAnimation: "increasing",
          progressBar: true,
          timeOut: 2000,
        }),
        HttpClientModule,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],

      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
