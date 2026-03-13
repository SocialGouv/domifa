import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqVideoTutorialComponent } from "./faq-video-tutorial.component";

describe("FaqVideoTutorialComponent", () => {
  let component: FaqVideoTutorialComponent;
  let fixture: ComponentFixture<FaqVideoTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqVideoTutorialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqVideoTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
