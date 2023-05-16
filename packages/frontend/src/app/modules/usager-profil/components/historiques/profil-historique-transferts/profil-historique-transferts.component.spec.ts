import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueTransfertsComponent } from "./profil-historique-transferts.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { USAGER_ACTIF_MOCK } from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

describe("ProfilHistoriqueTransfertsComponent", () => {
  let component: ProfilHistoriqueTransfertsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueTransfertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueTransfertsComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueTransfertsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
