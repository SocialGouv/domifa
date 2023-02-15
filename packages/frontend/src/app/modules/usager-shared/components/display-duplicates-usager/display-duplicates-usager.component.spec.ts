import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayDuplicatesUsagerComponent } from "./display-duplicates-usager.component";

describe("DisplayDuplicatesUsagerComponent", () => {
  let component: DisplayDuplicatesUsagerComponent;
  let fixture: ComponentFixture<DisplayDuplicatesUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayDuplicatesUsagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayDuplicatesUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
