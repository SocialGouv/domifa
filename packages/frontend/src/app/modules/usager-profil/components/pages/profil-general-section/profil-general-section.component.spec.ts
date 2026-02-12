import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks/USAGER_VALIDE.mock";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilGeneralSectionComponent } from "./profil-general-section.component";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { SharedModule } from "../../../../shared/shared.module";

describe("ProfilGeneralSectionComponent", () => {
  let component: ProfilGeneralSectionComponent;
  let fixture: ComponentFixture<ProfilGeneralSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilGeneralSectionComponent],
      imports: [
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        SharedModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilGeneralSectionComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
