import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { StructureEditFormComponent } from "./structure-edit-form.component";

describe("StructureEditFormComponent", () => {
  let component: StructureEditFormComponent;
  let fixture: ComponentFixture<StructureEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructureEditFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
