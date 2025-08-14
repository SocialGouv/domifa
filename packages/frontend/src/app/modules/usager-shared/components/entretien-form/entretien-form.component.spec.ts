import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";
import { EntretienFormComponent } from "./entretien-form.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("EntretienFormComponent", () => {
  let component: EntretienFormComponent;
  let fixture: ComponentFixture<EntretienFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EntretienFormComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntretienFormComponent);
    component = fixture.debugElement.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
