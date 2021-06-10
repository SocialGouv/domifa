import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { UsagersModule } from "../../usagers.module";
import { ImportComponent } from "./import.component";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("ImportComponent", () => {
  let fixture: ComponentFixture<ImportComponent>;
  let app: ImportComponent;

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

      fixture = TestBed.createComponent(ImportComponent);
      app = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    })
  );

  it("should create", () => {
    expect(app).toBeTruthy();
  });
});
