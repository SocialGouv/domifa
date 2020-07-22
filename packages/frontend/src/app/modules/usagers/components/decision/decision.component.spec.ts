import { async, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("DecisionComponent", () => {
  let usagerService: UsagerService;

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
    });

    /*
  usagerService.findOne(1).subscribe((usager: Usager) => {
      fixture = TestBed.createComponent(DecisionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.usager = usager;
    });
    */
  }));

  it("should create", () => {
    usagerService = TestBed.get(UsagerService);
  });
});
