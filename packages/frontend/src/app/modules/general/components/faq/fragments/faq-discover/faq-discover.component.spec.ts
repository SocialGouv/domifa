import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqDiscoverComponent } from "./faq-discover.component";

describe("FaqDiscoverComponent", () => {
  let component: FaqDiscoverComponent;
  let fixture: ComponentFixture<FaqDiscoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqDiscoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqDiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
