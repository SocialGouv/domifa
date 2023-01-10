import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CguResponsableComponent } from "./cgu-responsable.component";

describe("CguResponsableComponent", () => {
  let component: CguResponsableComponent;
  let fixture: ComponentFixture<CguResponsableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CguResponsableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CguResponsableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
