import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { StructuresEditComponent } from "./structures-edit.component";

describe("StructuresEditComponent", () => {
  let component: StructuresEditComponent;
  let fixture: ComponentFixture<StructuresEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
