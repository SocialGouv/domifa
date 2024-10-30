import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionDocsComponent } from "./section-docs.component";

describe("SectionDocsComponent", () => {
  let component: SectionDocsComponent;
  let fixture: ComponentFixture<SectionDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionDocsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
