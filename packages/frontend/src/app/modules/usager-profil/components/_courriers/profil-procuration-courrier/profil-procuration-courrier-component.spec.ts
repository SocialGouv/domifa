import { APP_BASE_HREF, CommonModule } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbDatepickerI18n, NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_ACTIF_MOCK } from "../../../../../../_common/mocks/USAGER_ACTIF.mock";
import { MATOMO_INJECTORS, _usagerReducer } from "../../../../../shared";
import { NotFoundComponent } from "../../../../general/components/errors/not-found/not-found.component";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "../../../../shared/shared.module";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
} from "../../../../shared/services";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilProcurationCourrierComponent>;
  let component: UsagersProfilProcurationCourrierComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilProcurationCourrierComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: "404", component: NotFoundComponent },
        ]),
        CommonModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        NgbModule,
        FormsModule,
        HttpClientTestingModule,
        SharedModule,
        ReactiveFormsModule,
        ...MATOMO_INJECTORS,
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        NgbDateCustomParserFormatter,
        { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      UsagersProfilProcurationCourrierComponent
    );
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.ngOnInit();
  });

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
