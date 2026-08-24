import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqCommunicationKitComponent } from "./faq-communication-kit.component";

describe("FaqCommunicationKitComponent", () => {
  let component: FaqCommunicationKitComponent;
  let fixture: ComponentFixture<FaqCommunicationKitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqCommunicationKitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqCommunicationKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
