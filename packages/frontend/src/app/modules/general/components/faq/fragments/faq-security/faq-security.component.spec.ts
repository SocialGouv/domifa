import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqSecurityComponent } from "./faq-security.component";

describe("FaqSecurityComponent", () => {
  let component: FaqSecurityComponent;
  let fixture: ComponentFixture<FaqSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSecurityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
