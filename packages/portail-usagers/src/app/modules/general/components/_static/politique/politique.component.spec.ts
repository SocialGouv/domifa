import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { PolitiqueComponent } from "./politique.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MATOMO_INJECTORS } from "../../../../../shared";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("PolitiqueComponent", () => {
  let component: PolitiqueComponent;
  let fixture: ComponentFixture<PolitiqueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PolitiqueComponent],
      imports: [ReactiveFormsModule, MATOMO_INJECTORS, FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
