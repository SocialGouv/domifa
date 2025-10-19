import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFormRefusComponent } from "./structure-form-refus.component";

describe("StructureFormRefusComponent", () => {
  let component: StructureFormRefusComponent;
  let fixture: ComponentFixture<StructureFormRefusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFormRefusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFormRefusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
