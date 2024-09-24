import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminPortailUsagersMenuComponent } from "./admin-portail-usagers-menu.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("AdminPortailUsagersMenuComponent", () => {
  let component: AdminPortailUsagersMenuComponent;
  let fixture: ComponentFixture<AdminPortailUsagersMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPortailUsagersMenuComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortailUsagersMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
