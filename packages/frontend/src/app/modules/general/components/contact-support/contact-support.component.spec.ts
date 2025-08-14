import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ContactSupportComponent } from "./contact-support.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ContactSupportComponent", () => {
  let component: ContactSupportComponent;
  let fixture: ComponentFixture<ContactSupportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        NoopAnimationsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
