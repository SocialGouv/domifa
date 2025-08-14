import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BaseUsagerProfilPageComponent } from "./base-usager-profil-page.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("BaseUsagerProfilPageComponent", () => {
  let component: BaseUsagerProfilPageComponent;
  let fixture: ComponentFixture<BaseUsagerProfilPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseUsagerProfilPageComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseUsagerProfilPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
