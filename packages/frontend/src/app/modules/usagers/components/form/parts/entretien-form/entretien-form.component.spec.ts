import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { EntretienFormComponent } from "./entretien-form.component";

describe("EntretienFormComponent", () => {
  let component: EntretienFormComponent;
  let fixture: ComponentFixture<EntretienFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        RouterTestingModule,
        NgbModule,
        MatomoModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      declarations: [EntretienFormComponent],
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
    });
    fixture = TestBed.createComponent(EntretienFormComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
