import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagersModule } from "../../usagers.module";
import { UploadComponent } from "./upload.component";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("UploadComponent", () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

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
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    const usager: Usager = new Usager();
    component.usager = usager;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
