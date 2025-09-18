import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { PolitiqueComponent } from "./politique.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("PolitiqueComponent", () => {
  let component: PolitiqueComponent;
  let fixture: ComponentFixture<PolitiqueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [PolitiqueComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolitiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
