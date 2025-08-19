import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminPortailUsagersMenuComponent } from "./admin-portail-usagers-menu.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CommonModule } from "@angular/common";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { SharedModule } from "../../../shared/shared.module";
import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks";

describe("AdminPortailUsagersMenuComponent", () => {
  let component: AdminPortailUsagersMenuComponent;
  let fixture: ComponentFixture<AdminPortailUsagersMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPortailUsagersMenuComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        SharedModule,
        CommonModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortailUsagersMenuComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
