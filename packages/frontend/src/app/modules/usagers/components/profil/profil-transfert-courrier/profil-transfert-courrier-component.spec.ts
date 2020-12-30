import { APP_BASE_HREF, Location } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { LoadingService } from "../../../../loading/loading.service";

import { Usager } from "../../../interfaces/usager";
import { UsagerService } from "../../../services/usager.service";
import { UsagersProfilTransfertCourrierComponent } from "./profil-transfert-courrier-component";

describe("UsagersProfilTransfertCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilTransfertCourrierComponent>;
  let component: UsagersProfilTransfertCourrierComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilTransfertCourrierComponent],
      imports: [
        MatomoModule,
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        LoadingService,
        UsagerService,
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

    fixture = TestBed.createComponent(UsagersProfilTransfertCourrierComponent);
    component = fixture.debugElement.componentInstance;
    component.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
