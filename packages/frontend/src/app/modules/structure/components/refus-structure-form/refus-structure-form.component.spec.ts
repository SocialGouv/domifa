import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RefusStructureFormComponent } from "./refus-structure-form.component";

describe("RefusStructureFormComponent", () => {
  let component: RefusStructureFormComponent;
  let fixture: ComponentFixture<RefusStructureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefusStructureFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RefusStructureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
