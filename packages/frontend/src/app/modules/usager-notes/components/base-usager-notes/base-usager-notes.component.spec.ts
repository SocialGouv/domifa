import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseUsagerNotesComponent } from "./base-usager-notes.component";

describe("BaseUsagerNotesComponent", () => {
  let component: BaseUsagerNotesComponent;
  let fixture: ComponentFixture<BaseUsagerNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseUsagerNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseUsagerNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
