import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminPortailUsagersMenuComponent } from "./admin-portail-usagers-menu.component";

describe("AdminPortailUsagersMenuComponent", () => {
  let component: AdminPortailUsagersMenuComponent;
  let fixture: ComponentFixture<AdminPortailUsagersMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPortailUsagersMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortailUsagersMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
