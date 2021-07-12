import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { UsagersModule } from "src/app/modules/usagers/usagers.module";
import { usagerValideMock } from "../../../../../../../_common/mocks/usagerValideMock.mock";

import { UsagerFormModel } from "../../UsagerFormModel";
import { RdvComponent } from "./rdv.component";

describe("RdvComponent", () => {
  let component: RdvComponent;
  let fixture: ComponentFixture<RdvComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [UsagersModule, RouterTestingModule],
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
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RdvComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
