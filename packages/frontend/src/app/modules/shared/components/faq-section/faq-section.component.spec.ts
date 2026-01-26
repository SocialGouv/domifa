import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqSectionComponent } from "./faq-section.component";
import { RouterModule } from "@angular/router";

describe("FaqSectionComponent", () => {
  let component: FaqSectionComponent;
  let fixture: ComponentFixture<FaqSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSectionComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
