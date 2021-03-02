import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { usagerValideMock } from "../../../../../../_common/mocks/usager.mock";
import { NotFoundComponent } from "../../../../general/components/errors/not-found/not-found.component";
import { UsagerFormModel } from "../../form/UsagerFormModel";
import { UsagersProfilTransfertCourrierComponent } from "./profil-transfert-courrier-component";

describe("UsagersProfilTransfertCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilTransfertCourrierComponent>;
  let component: UsagersProfilTransfertCourrierComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UsagersProfilTransfertCourrierComponent,
        NotFoundComponent,
      ],
      imports: [
        NgbModule,
        MatomoModule,
        RouterTestingModule.withRoutes([
          { path: "404", component: NotFoundComponent },
        ]),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
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

    fixture = TestBed.createComponent(UsagersProfilTransfertCourrierComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);
    component.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
