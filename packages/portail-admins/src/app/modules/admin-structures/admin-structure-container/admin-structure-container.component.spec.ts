import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminStructureContainerComponent } from "./admin-structure-container.component";

describe("AdminStructureContainerComponent", () => {
  let component: AdminStructureContainerComponent;
  let fixture: ComponentFixture<AdminStructureContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStructureContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStructureContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
