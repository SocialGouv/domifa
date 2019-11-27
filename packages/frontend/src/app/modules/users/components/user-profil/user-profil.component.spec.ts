import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UserProfilComponent } from "./user-profil.component";

describe("UserProfilComponent", () => {
  let component: UserProfilComponent;
  let fixture: ComponentFixture<UserProfilComponent>;

  beforeAll(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfilComponent],
      imports: [RouterTestingModule, HttpClientModule, HttpClientTestingModule],
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
