import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SupervisorListComponent } from "./supervisor-list.component";
import { RouterModule } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("SupervisorListComponent", () => {
  let component: SupervisorListComponent;
  let fixture: ComponentFixture<SupervisorListComponent>;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      declarations: [SupervisorListComponent],
      imports: [RouterModule.forRoot([]), ReactiveFormsModule, FormsModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SupervisorListComponent);
    component = fixture.componentInstance;
  });

  it("0. create component", () => {
    expect(component).toBeTruthy();
  });
});
