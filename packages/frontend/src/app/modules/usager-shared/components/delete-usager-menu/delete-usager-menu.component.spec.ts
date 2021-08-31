import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { DeleteUsagerMenuComponent } from "./delete-usager-menu.component";
import { APP_BASE_HREF } from "@angular/common";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { RouterTestingModule } from "@angular/router/testing";

describe("DeleteUsagerMenuComponent", () => {
  let component: DeleteUsagerMenuComponent;
  let fixture: ComponentFixture<DeleteUsagerMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgbModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        HttpClientTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
      declarations: [DeleteUsagerMenuComponent],
    });
    fixture = TestBed.createComponent(DeleteUsagerMenuComponent);
    component = fixture.debugElement.componentInstance;
    component.ngOnInit();
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
