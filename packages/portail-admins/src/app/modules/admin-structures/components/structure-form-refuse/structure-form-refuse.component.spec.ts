import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureFormRefuseComponent } from "./structure-form-refuse.component";

describe("StructureFormRefuseComponent", () => {
  let component: StructureFormRefuseComponent;
  let fixture: ComponentFixture<StructureFormRefuseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFormRefuseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureFormRefuseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
