import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BaseUsagerDossierPageComponent } from "./base-usager-dossier-page.component";
import { StoreModule } from "@ngrx/store";
import { MockStore } from "@ngrx/store/testing";
import { _usagerReducer } from "../../../../shared";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("BaseUsagerDossierPageComponent", () => {
  let component: BaseUsagerDossierPageComponent;
  let fixture: ComponentFixture<BaseUsagerDossierPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseUsagerDossierPageComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        ...NGRX_PROVIDERS_TESTING,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    TestBed.inject(MockStore);

    fixture = TestBed.createComponent(BaseUsagerDossierPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
