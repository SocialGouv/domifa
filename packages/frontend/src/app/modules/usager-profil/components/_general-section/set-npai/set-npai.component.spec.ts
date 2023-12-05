import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetNpaiComponent } from "./set-npai.component";

describe("SetNpaiComponent", () => {
  let component: SetNpaiComponent;
  let fixture: ComponentFixture<SetNpaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetNpaiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SetNpaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
