import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFormDeleteComponent } from "./structure-form-delete.component";

describe("StructureFormDeleteComponent", () => {
  let component: StructureFormDeleteComponent;
  let fixture: ComponentFixture<StructureFormDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFormDeleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFormDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
