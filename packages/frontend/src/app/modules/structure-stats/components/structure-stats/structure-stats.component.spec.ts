import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { StructuresModule } from "src/app/modules/structures/structures.module";

import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";
import { StuctureStatsComponent } from "./structure-stats.component";

import { SharedModule } from "../../../shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StuctureStatsComponent", () => {
  let component: StuctureStatsComponent;
  let fixture: ComponentFixture<StuctureStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StuctureStatsComponent],
      imports: [
        StructuresModule,
        HttpClientTestingModule,
        NgbModule,
        FormsModule,
        SharedModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
        ...MATOMO_INJECTORS,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StuctureStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
