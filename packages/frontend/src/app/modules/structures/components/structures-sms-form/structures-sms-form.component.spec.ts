import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { StructuresSmsFormComponent } from "./structures-sms-form.component";

describe("StructuresSmsFormComponent", () => {
  let component: StructuresSmsFormComponent;
  let fixture: ComponentFixture<StructuresSmsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresSmsFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresSmsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
