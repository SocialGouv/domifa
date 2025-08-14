import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

import { StructuresEditComponent } from "./structures-edit.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StructuresEditComponent", () => {
  let component: StructuresEditComponent;
  let fixture: ComponentFixture<StructuresEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresEditComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
        NgxIntlTelInputModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
