import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LoadingComponent } from "./loading.component";
import { LoadingService } from "./loading.service";

describe("LoadingComponent", () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let service: LoadingService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      imports: [NgbModule, RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LoadingService);
    fixture.detectChanges();
  }));

  it("should create", waitForAsync(() => {
    expect(component).toBeTruthy();
    expect(component.loading).toBeFalsy();

    service.startLoading();
    component.ngOnInit();
    setTimeout(() => {
      expect(component.loading).toBeTruthy();
    }, 1000);

    component.ngOnDestroy();
    expect(component.loading).toBeFalsy();
  }));
});
