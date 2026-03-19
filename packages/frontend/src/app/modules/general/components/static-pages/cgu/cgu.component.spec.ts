import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CguComponent } from "./cgu.component";

describe("CguComponent", () => {
  let component: CguComponent;
  let fixture: ComponentFixture<CguComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CguComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
