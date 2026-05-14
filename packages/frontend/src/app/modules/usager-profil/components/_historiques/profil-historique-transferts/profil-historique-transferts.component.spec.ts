import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueTransfertsComponent } from "./profil-historique-transferts.component";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";

describe("ProfilHistoriqueTransfertsComponent", () => {
  let component: ProfilHistoriqueTransfertsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueTransfertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueTransfertsComponent],
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueTransfertsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
