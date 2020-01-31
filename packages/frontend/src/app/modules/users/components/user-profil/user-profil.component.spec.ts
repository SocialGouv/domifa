import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";
import { UserProfilComponent } from "./user-profil.component";

describe("UserProfilComponent", () => {
  let component: UserProfilComponent;
  let fixture: ComponentFixture<UserProfilComponent>;

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfilComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot({
          enableHtml: true,
          positionClass: "toast-top-full-width",
          preventDuplicates: true,
          progressAnimation: "increasing",
          progressBar: true,
          timeOut: 2000
        })
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(UserProfilComponent);
    component = fixture.componentInstance;
  }));

  it("0. create component", () => {
    expect(component).toBeTruthy();
  });
});
