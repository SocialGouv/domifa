import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionLinksComponent } from "./section-links.component";

describe("SectionLinksComponent", () => {
  let component: SectionLinksComponent;
  let fixture: ComponentFixture<SectionLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionLinksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
