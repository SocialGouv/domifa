import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfilHistoriqueLoginPortailComponent } from "./profil-historique-login-portail.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { SharedModule } from "../../../../shared/shared.module";

describe("ProfilHistoriqueLoginPortailComponent", () => {
  let component: ProfilHistoriqueLoginPortailComponent;
  let fixture: ComponentFixture<ProfilHistoriqueLoginPortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueLoginPortailComponent],
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        NoopAnimationsModule,
        SharedModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilHistoriqueLoginPortailComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
