import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqSupportComponent } from "./faq-support.component";

describe("FaqSupportComponent", () => {
  let component: FaqSupportComponent;
  let fixture: ComponentFixture<FaqSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSupportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
