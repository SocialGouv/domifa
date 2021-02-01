import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { usagerValideMock } from "../../../../../_common/mocks/usager.mock";
import { UsagersModule } from "../../usagers.module";
import { DocumentsComponent } from "./documents.component";

describe("DocumentsComponent", () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;

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
    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    const usager = usagerValideMock;
    component.usager = usager;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
