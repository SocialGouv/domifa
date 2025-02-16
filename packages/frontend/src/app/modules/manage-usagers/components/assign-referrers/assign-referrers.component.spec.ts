import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignReferrersComponent } from "./assign-referrers.component";

describe("AssignReferrersComponent", () => {
  let component: AssignReferrersComponent;
  let fixture: ComponentFixture<AssignReferrersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignReferrersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignReferrersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
