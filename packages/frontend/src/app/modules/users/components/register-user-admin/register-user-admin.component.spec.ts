import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterUserAdminComponent } from "./register-user-admin.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ToastrModule } from "ngx-toastr";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("RegisterUserAdminComponent", () => {
  let component: RegisterUserAdminComponent;
  let fixture: ComponentFixture<RegisterUserAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserAdminComponent],
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
    fixture = TestBed.createComponent(RegisterUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
