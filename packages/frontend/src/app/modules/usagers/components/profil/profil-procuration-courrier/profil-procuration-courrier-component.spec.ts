import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { usagerValideMock } from "../../../../../../_common/mocks/usager.mock";
import { userMock } from "../../../../../../_common/mocks/user.mock";
import { GeneralModule } from "../../../../general/general.module";
import { LoadingService } from "../../../../loading/loading.service";
import { StatsModule } from "../../../../stats/stats.module";
import { StructuresModule } from "../../../../structures/structures.module";
import { appUserBuilder } from "../../../../users/services";
import { UsersModule } from "../../../../users/users.module";
import { Usager } from "../../../interfaces/usager";

import { UsagerService } from "../../../services/usager.service";
import { UsagersModule } from "../../../usagers.module";

import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilProcurationCourrierComponent>;
  let component: UsagersProfilProcurationCourrierComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilProcurationCourrierComponent],
      imports: [
        GeneralModule,
        StatsModule,
        UsersModule,
        StructuresModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      UsagersProfilProcurationCourrierComponent
    );
    component = fixture.componentInstance;
    component.me = appUserBuilder.buildAppUser(userMock);
    component.usager = new Usager(usagerValideMock);
    component.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
