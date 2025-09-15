import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";

import { HomeUsagerComponent } from "./home-usager.component";
import { UsagerAccountModule } from "../../usager-account.module";
import { RouterModule } from "@angular/router";
import { StructureInformationService } from "../../services/structure-information.service";
import { BehaviorSubject, of } from "rxjs";
import { PortailUsagerProfile, StructureInformation } from "@domifa/common";
import {
  unMessageCourant,
  unMessageFutur,
  unMessagePasse,
} from "../../../../../_tests/mocks/STRUCTURE_INFORMATION.mock";
import { unProfilUsager } from "../../../../../_tests/mocks/PORTAIL_USAGER_PROFILE.mock";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe("HomeUsagerComponent", () => {
  const messagesStructures: StructureInformation[] = [
    unMessageCourant,
    unMessagePasse,
    unMessageFutur,
  ];
  const structureInformationService = {
    getAllStructureInformation: jest.fn(() => of(messagesStructures)),
  };
  const authService = {
    currentUsagerSubject: new BehaviorSubject<PortailUsagerProfile>(
      unProfilUsager
    ),
  };
  let component: HomeUsagerComponent;
  let fixture: ComponentFixture<HomeUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeUsagerComponent],
      imports: [UsagerAccountModule, RouterModule.forRoot([])],
      providers: [
        provideHttpClientTesting(),
        {
          provide: StructureInformationService,
          useValue: structureInformationService,
        },
        {
          provide: UsagerAuthService,
          useValue: authService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("Filter out obsolete messages", fakeAsync(() => {
    tick();
    expect(component.structureInformation.length).toEqual(1);
    expect(component.structureInformation[0].title).toEqual(
      "Un message courant"
    );
  }));
});
