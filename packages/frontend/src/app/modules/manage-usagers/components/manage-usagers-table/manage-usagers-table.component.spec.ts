import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ManageUsagersTableComponent } from "./manage-usagers-table.component";
import { MATOMO_INJECTORS, _usagerReducer } from "../../../../shared";
import { StoreModule } from "@ngrx/store";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { Subject } from "rxjs";
import { UsagersFilterCriteria } from "../../classes";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ManageUsagersTableComponent", () => {
  let component: ManageUsagersTableComponent;
  let fixture: ComponentFixture<ManageUsagersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        NgbModule,
        ...MATOMO_INJECTORS,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ManageUsagersTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsagersTableComponent);
    component = fixture.componentInstance;
    component.filters = new UsagersFilterCriteria();
    component.filters$ = new Subject();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
