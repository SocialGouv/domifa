import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InputNationalityComponent } from "./input-nationality.component";

describe("InputNationalityComponent", () => {
  let component: InputNationalityComponent;
  let fixture: ComponentFixture<InputNationalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputNationalityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNationalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
