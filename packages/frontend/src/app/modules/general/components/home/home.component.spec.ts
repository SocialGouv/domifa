import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HomeComponent } from "./home.component";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { SharedModule } from "../../../../modules/shared/shared.module";
import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        CommonModule,
        SharedModule,
        RouterModule.forRoot([]),
        ...MATOMO_INJECTORS,
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
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
