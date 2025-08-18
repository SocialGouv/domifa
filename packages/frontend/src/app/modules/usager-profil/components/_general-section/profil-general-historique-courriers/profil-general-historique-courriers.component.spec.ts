import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks/USAGER_VALIDE.mock";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilGeneralHistoriqueCourriersComponent } from "./profil-general-historique-courriers.component";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilGeneralHistoriqueCourriersComponent", () => {
  let component: ProfilGeneralHistoriqueCourriersComponent;
  let fixture: ComponentFixture<ProfilGeneralHistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilGeneralHistoriqueCourriersComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(
      ProfilGeneralHistoriqueCourriersComponent
    );
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
