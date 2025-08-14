import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { PlanSiteComponent } from "./plan-site.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("PlanSiteComponent", () => {
  let component: PlanSiteComponent;
  let fixture: ComponentFixture<PlanSiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlanSiteComponent],
      imports: [NgbModule, RouterModule.forRoot([])],
      providers: [provideHttpClient()],
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
