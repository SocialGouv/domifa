import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayLastLoginComponent } from "./display-last-login.component";

describe("DisplayLastLoginComponent", () => {
  let component: DisplayLastLoginComponent;
  let fixture: ComponentFixture<DisplayLastLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayLastLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayLastLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
