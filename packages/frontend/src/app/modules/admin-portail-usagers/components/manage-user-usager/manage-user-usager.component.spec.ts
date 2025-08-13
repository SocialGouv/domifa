import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageUserUsagerComponent } from "./manage-user-usager.component";

describe("ManageUserUsagerComponent", () => {
  let component: ManageUserUsagerComponent;
  let fixture: ComponentFixture<ManageUserUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageUserUsagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUserUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
