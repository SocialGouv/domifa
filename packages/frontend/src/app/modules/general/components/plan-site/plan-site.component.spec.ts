import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { PlanSiteComponent } from "./plan-site.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("PlanSiteComponent", () => {
  let component: PlanSiteComponent;
  let fixture: ComponentFixture<PlanSiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlanSiteComponent],
      imports: [
        NgbModule,
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
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
