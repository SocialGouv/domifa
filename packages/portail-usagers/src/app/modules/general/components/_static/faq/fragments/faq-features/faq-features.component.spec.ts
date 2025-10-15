import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqFeaturesComponent } from "./faq-features.component";

describe("FaqFeaturesComponent", () => {
  let component: FaqFeaturesComponent;
  let fixture: ComponentFixture<FaqFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqFeaturesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
