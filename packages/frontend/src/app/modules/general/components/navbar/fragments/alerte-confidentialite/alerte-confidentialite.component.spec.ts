import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AlerteConfidentialiteComponent } from "./alerte-confidentialite.component";
import { RouterModule } from "@angular/router";

describe("AlerteConfidentialiteComponent", () => {
  let component: AlerteConfidentialiteComponent;
  let fixture: ComponentFixture<AlerteConfidentialiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlerteConfidentialiteComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AlerteConfidentialiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
