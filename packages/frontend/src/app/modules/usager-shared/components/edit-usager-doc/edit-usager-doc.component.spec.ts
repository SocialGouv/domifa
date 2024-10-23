import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditUsagerDocComponent } from "./edit-usager-doc.component";

describe("EditUsagerDocComponent", () => {
  let component: EditUsagerDocComponent;
  let fixture: ComponentFixture<EditUsagerDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditUsagerDocComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditUsagerDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
