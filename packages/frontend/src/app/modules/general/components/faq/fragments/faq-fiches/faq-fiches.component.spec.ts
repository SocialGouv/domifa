import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqFichesComponent } from "./faq-fiches.component";

describe("FaqFichesComponent", () => {
  let component: FaqFichesComponent;
  let fixture: ComponentFixture<FaqFichesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqFichesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqFichesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
