import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RegisterUserAdminComponent } from "./register-user-admin.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("RegisterUserAdminComponent", () => {
  let component: RegisterUserAdminComponent;
  let fixture: ComponentFixture<RegisterUserAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserAdminComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserAdminComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
