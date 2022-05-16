import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlanSiteComponent } from './plan-site.component';
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe('PlanSiteComponent', () => {
  let component: PlanSiteComponent;
  let fixture: ComponentFixture<PlanSiteComponent>;

  beforeEach(
    waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PlanSiteComponent],
      imports: [
        ComponentFixture,
        TestBed,
        RouterTestingModule,
        HttpClientTestingModule,

      ],
    }).compileComponents();
  })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
