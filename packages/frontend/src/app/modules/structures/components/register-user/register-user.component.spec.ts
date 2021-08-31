import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { RegisterUserComponent } from "./register-user.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("RegisterUserComponent", () => {
  let component: RegisterUserComponent;
  let fixture: ComponentFixture<RegisterUserComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RegisterUserComponent],
        imports: [
          NgbModule,
          ReactiveFormsModule,
          FormsModule,
          ToastrModule.forRoot(),
          HttpClientTestingModule,
          RouterTestingModule,
        ],

        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
