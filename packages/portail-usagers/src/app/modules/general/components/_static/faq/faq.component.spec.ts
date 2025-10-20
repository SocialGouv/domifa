import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqComponent } from "./faq.component";
import { RouterModule } from "@angular/router";

describe("FaqComponent", () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
