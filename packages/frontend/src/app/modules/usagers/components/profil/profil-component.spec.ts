import { GeneralModule } from "src/app/modules/general/general.module";
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
import { NotFoundComponent } from "../../../general/components/errors/not-found/not-found.component";
import { SharedModule } from "../../../shared/shared.module";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";
import { UsagersProfilComponent } from "./profil-component";

describe("UsagersProfilComponent", () => {
  let fixture: ComponentFixture<UsagersProfilComponent>;

  let component: UsagersProfilComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilComponent],
      imports: [
        SharedModule,
        NgbModule,
        GeneralModule,
        MatomoModule,
        RouterTestingModule.withRoutes([
          { path: "404", component: NotFoundComponent },
        ]),
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
      ],
      providers: [
        InteractionService,
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

    fixture = TestBed.createComponent(UsagersProfilComponent);
    component = fixture.debugElement.componentInstance;
    component.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
