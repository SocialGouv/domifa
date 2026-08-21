import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { CguComponent } from "./cgu.component";

describe("CguComponent", () => {
  let component: CguComponent;
  let fixture: ComponentFixture<CguComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CguComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
