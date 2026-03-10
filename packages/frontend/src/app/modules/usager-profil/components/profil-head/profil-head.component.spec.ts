import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";

import { ProfilHeadComponent } from "./profil-head.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";

describe("ProfilHeadComponent", () => {
  let component: ProfilHeadComponent;
  let fixture: ComponentFixture<ProfilHeadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilHeadComponent],
      imports: [
        CommonModule,
        FormsModule,
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        SharedModule,
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
    fixture = TestBed.createComponent(ProfilHeadComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
