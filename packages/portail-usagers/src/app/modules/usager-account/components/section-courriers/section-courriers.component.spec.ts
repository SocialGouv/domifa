import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionCourriersComponent } from "./section-courriers.component";

describe("SectionCourriersComponent", () => {
  let component: SectionCourriersComponent;
  let fixture: ComponentFixture<SectionCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionCourriersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
