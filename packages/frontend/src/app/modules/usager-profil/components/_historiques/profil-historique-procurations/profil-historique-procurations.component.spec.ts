import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueProcurationsComponent } from "./profil-historique-procurations.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";

describe("ProfilHistoriqueProcurationsComponent", () => {
  let component: ProfilHistoriqueProcurationsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueProcurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueProcurationsComponent],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueProcurationsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
