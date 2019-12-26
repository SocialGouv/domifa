import { async, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";

describe("DecisionComponent", () => {
  let usagerService: UsagerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [UsagersModule],
      providers: [UsagerService, { provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
