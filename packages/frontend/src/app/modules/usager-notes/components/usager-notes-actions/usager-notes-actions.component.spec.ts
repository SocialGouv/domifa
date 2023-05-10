import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerNotesActionsComponent } from "./usager-notes-actions.component";

describe("UsagerNotesActionsComponent", () => {
  let component: UsagerNotesActionsComponent;
  let fixture: ComponentFixture<UsagerNotesActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerNotesActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagerNotesActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
