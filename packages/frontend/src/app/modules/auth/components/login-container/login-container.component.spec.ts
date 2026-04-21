import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginContainerComponent } from "./login-container.component";

describe("LoginContainerComponent", () => {
  let component: LoginContainerComponent;
  let fixture: ComponentFixture<LoginContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
