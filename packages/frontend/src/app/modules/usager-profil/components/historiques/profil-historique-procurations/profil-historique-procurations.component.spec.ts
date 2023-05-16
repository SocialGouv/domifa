import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueProcurationsComponent } from "./profil-historique-procurations.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { USAGER_ACTIF_MOCK } from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

describe("ProfilHistoriqueProcurationsComponent", () => {
  let component: ProfilHistoriqueProcurationsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueProcurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueProcurationsComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueProcurationsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
