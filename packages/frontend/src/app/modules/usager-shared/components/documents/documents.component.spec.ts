import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { usagerValideMock } from "../../../../../_common/mocks/usagerValideMock.mock";
import { UsagersModule } from "../../../usagers/usagers.module";

import { DocumentsComponent } from "./documents.component";

describe("DocumentsComponent", () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;

  beforeEach(
    waitForAsync(() => {
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
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    const usager = usagerValideMock;
    component.usager = usager;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
