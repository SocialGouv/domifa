import { APP_BASE_HREF } from "@angular/common";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks";
import { MATOMO_INJECTORS, _usagerReducer } from "../../../../../shared";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { UsagersProfilTransfertCourrierComponent } from "./profil-transfert-courrier-component";
import { StoreModule } from "@ngrx/store";
import { UsagerProfilModule } from "../../../usager-profil.module";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("UsagersProfilTransfertCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilTransfertCourrierComponent>;
  let component: UsagersProfilTransfertCourrierComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilTransfertCourrierComponent],
      imports: [
        FormsModule,
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        ...MATOMO_INJECTORS,
        StoreModule.forRoot({ app: _usagerReducer }),
        UsagerProfilModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagersProfilTransfertCourrierComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
