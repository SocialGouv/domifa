import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { RgpdWarningComponent } from "./rgpd-warning.component";

describe("RgpdWarningComponent", () => {
  let component: RgpdWarningComponent;
  let fixture: ComponentFixture<RgpdWarningComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RgpdWarningComponent],
        imports: [],
        providers: [],
        schemas: [],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RgpdWarningComponent);
    component = fixture.debugElement.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
