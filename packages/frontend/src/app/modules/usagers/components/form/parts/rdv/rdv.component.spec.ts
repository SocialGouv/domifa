import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagersModule } from "src/app/modules/usagers/usagers.module";
import { RdvComponent } from "./rdv.component";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("RdvComponent", () => {
  let component: RdvComponent;
  let fixture: ComponentFixture<RdvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [UsagersModule],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RdvComponent);
    component = fixture.debugElement.componentInstance;
    const usager: Usager = new Usager();
    component.usager = usager;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
