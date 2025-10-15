import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqAccessComponent } from "./faq-access.component";

describe("FaqAccessComponent", () => {
  let component: FaqAccessComponent;
  let fixture: ComponentFixture<FaqAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAccessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
