import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { usagerValideMock } from "../../../../../../_common/mocks/usagerValideMock.mock";

import { UsagerFormModel } from "../../form/UsagerFormModel";

import { SetInteractionOutFormComponent } from "./set-interaction-out-form.component";

describe("SetInteractionOutFormComponent", () => {
  let component: SetInteractionOutFormComponent;
  let fixture: ComponentFixture<SetInteractionOutFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SetInteractionOutFormComponent],
        imports: [NgbModule, ToastrModule.forRoot(), HttpClientTestingModule],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionOutFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
