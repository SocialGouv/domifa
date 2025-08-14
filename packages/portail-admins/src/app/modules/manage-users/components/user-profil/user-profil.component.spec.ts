import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { UserProfilComponent } from "./user-profil.component";
import { RouterModule } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("UserProfilComponent", () => {
  let component: UserProfilComponent;
  let fixture: ComponentFixture<UserProfilComponent>;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      declarations: [UserProfilComponent],
      imports: [RouterModule.forRoot([]), ReactiveFormsModule, FormsModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(UserProfilComponent);
    component = fixture.componentInstance;
  });

  it("0. create component", () => {
    expect(component).toBeTruthy();
  });
});
