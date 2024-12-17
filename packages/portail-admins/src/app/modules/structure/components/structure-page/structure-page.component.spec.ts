import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructurePageComponent } from "./structure-page.component";

describe("StructurePageComponent", () => {
  let component: StructurePageComponent;
  let fixture: ComponentFixture<StructurePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructurePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StructurePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
