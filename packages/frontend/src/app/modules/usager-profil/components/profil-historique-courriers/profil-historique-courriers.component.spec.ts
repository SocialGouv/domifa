import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

import { ProfilHistoriqueCourriersComponent } from "./profil-historique-courriers.component";

describe("ProfilHistoriqueCourriersComponent", () => {
  let component: ProfilHistoriqueCourriersComponent;
  let fixture: ComponentFixture<ProfilHistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueCourriersComponent],
      imports: [
        MatomoModule,
        ReactiveFormsModule,
        NgbModule,
        FormsModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueCourriersComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
