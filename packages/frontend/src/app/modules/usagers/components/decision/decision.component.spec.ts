import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";
import { UsagersModule } from "../../usagers.module";
import { DecisionComponent } from "./decision.component";

describe("DecisionComponent", () => {
  let component: DecisionComponent;
  let fixture: ComponentFixture<DecisionComponent>;
  let usagerService: UsagerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [UsagersModule],
      providers: [UsagerService, { provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    usagerService = TestBed.get(UsagerService);

    /*
  usagerService.findOne(1).subscribe((usager: Usager) => {
      fixture = TestBed.createComponent(DecisionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.usager = usager;
    });
    */
  }));

  it("should create", () => {});
});
