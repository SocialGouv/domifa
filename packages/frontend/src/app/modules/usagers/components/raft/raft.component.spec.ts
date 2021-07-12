import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UsagersModule } from "../../usagers.module";
import { RaftComponent } from "./raft.component";
import { MatomoTracker, MatomoInjector } from "ngx-matomo";
import { RouterTestingModule } from "@angular/router/testing";

describe("RaftComponent", () => {
  let component: RaftComponent;
  let fixture: ComponentFixture<RaftComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [],
        imports: [
          UsagersModule,
          NgbModule,
          HttpClientModule,
          HttpClientTestingModule,
          RouterTestingModule,
        ],
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
    fixture = TestBed.createComponent(RaftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
