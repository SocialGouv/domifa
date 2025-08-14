import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";

import { SharedModule } from "../../../shared/shared.module";

import { NavbarComponent } from "./navbar.component";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("NavbarComponent", () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [
        CommonModule,
        SharedModule,
        RouterModule.forRoot([]),
        MATOMO_INJECTORS,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
