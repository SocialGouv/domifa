import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { PlanSiteComponent } from "./plan-site.component";

describe("PlanSiteComponent", () => {
  let component: PlanSiteComponent;
  let fixture: ComponentFixture<PlanSiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PlanSiteComponent],
      providers: [provideRouter([]), provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
