import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ImpactLineComponent } from "./impact-line.component";

describe("ImpactLineComponent", () => {
  let component: ImpactLineComponent;
  let fixture: ComponentFixture<ImpactLineComponent>;
  beforeEach(waitForAsync(() => {
    return TestBed.configureTestingModule({
      declarations: [ImpactLineComponent],
      imports: [NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpactLineComponent);
    component = fixture.componentInstance;
    component.direction = "horizontal";
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
