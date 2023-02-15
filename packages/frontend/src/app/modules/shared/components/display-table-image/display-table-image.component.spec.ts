import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayTableImageComponent } from "./display-table-image.component";

describe("DisplayTableImageComponent", () => {
  let component: DisplayTableImageComponent;
  let fixture: ComponentFixture<DisplayTableImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayTableImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayTableImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
