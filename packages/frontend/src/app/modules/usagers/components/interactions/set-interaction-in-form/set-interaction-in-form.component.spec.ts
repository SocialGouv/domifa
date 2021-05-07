import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { usagerValideMock } from "../../../../../../_common/mocks/usager.mock";
import { UsagerFormModel } from "../../form/UsagerFormModel";

import { SetInteractionInFormComponent } from "./set-interaction-in-form.component";

describe("SetInteractionInFormComponent", () => {
  let component: SetInteractionInFormComponent;
  let fixture: ComponentFixture<SetInteractionInFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionInFormComponent],
      imports: [NgbModule, ToastrModule.forRoot(), HttpClientTestingModule],
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
    fixture = TestBed.createComponent(SetInteractionInFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
