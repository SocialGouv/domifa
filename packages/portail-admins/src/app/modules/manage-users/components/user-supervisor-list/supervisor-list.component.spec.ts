import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SupervisorListComponent } from "./supervisor-list.component";
import { provideRouter } from "@angular/router";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { provideMockStore } from "@ngrx/store/testing";

describe("SupervisorListComponent", () => {
  let component: SupervisorListComponent;
  let fixture: ComponentFixture<SupervisorListComponent>;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, SupervisorListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideMockStore({}),
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
